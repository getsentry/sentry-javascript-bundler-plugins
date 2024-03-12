import SentryCli from "@sentry/cli";
import { transformAsync } from "@babel/core";
import componentNameAnnotatePlugin from "@sentry/babel-plugin-component-annotate";
import * as fs from "fs";
import * as path from "path";
import MagicString from "magic-string";
import { createUnplugin, TransformResult, UnpluginOptions } from "unplugin";
import { normalizeUserOptions, validateOptions } from "./options-mapping";
import { createDebugIdUploadFunction } from "./debug-id-upload";
import { releaseManagementPlugin } from "./plugins/release-management";
import { telemetryPlugin } from "./plugins/telemetry";
import { createLogger } from "./sentry/logger";
import { allowedToSendTelemetry, createSentryInstance } from "./sentry/telemetry";
import { Options, SentrySDKBuildFlags } from "./types";
import {
  generateGlobalInjectorCode,
  generateModuleMetadataInjectorCode,
  getDependencies,
  getPackageJson,
  parseMajorVersion,
  replaceBooleanFlagsInCode,
  stringToUUID,
  stripQueryAndHashFromPath,
} from "./utils";
import * as dotenv from "dotenv";
import { glob } from "glob";
import { logger } from "@sentry/utils";

interface SentryUnpluginFactoryOptions {
  releaseInjectionPlugin: (injectionCode: string) => UnpluginOptions;
  componentNameAnnotatePlugin?: () => UnpluginOptions;
  moduleMetadataInjectionPlugin?: (injectionCode: string) => UnpluginOptions;
  debugIdInjectionPlugin: () => UnpluginOptions;
  debugIdUploadPlugin: (upload: (buildArtifacts: string[]) => Promise<void>) => UnpluginOptions;
  bundleSizeOptimizationsPlugin: (buildFlags: SentrySDKBuildFlags) => UnpluginOptions;
}

/**
 * The sentry bundler plugin concerns itself with two things:
 * - Release injection
 * - Sourcemaps upload
 *
 * Release injection:
 * Per default the sentry bundler plugin will inject a global `SENTRY_RELEASE` into each JavaScript/TypeScript module
 * that is part of the bundle. On a technical level this is done by appending an import (`import "sentry-release-injector;"`)
 * to all entrypoint files of the user code (see `transformInclude` and `transform` hooks). This import is then resolved
 * by the sentry plugin to a virtual module that sets the global variable (see `resolveId` and `load` hooks).
 * If a user wants to inject the release into a particular set of modules they can use the `releaseInjectionTargets` option.
 *
 * Source maps upload:
 *
 * The sentry bundler plugin will also take care of uploading source maps to Sentry. This
 * is all done in the `writeBundle` hook. In this hook the sentry plugin will execute the
 * release creation pipeline:
 *
 * 1. Create a new release
 * 2. Delete already uploaded artifacts for this release (if `cleanArtifacts` is enabled)
 * 3. Upload sourcemaps based on `include` and source-map-specific options
 * 4. Associate a range of commits with the release (if `setCommits` is specified)
 * 5. Finalize the release (unless `finalize` is disabled)
 * 6. Add deploy information to the release (if `deploy` is specified)
 *
 * This release creation pipeline relies on Sentry CLI to execute the different steps.
 */
export function sentryUnpluginFactory({
  releaseInjectionPlugin,
  componentNameAnnotatePlugin,
  moduleMetadataInjectionPlugin,
  debugIdInjectionPlugin,
  debugIdUploadPlugin,
  bundleSizeOptimizationsPlugin,
}: SentryUnpluginFactoryOptions) {
  return createUnplugin<Options, true>((userOptions, unpluginMetaContext) => {
    const logger = createLogger({
      prefix: `[sentry-${unpluginMetaContext.framework}-plugin]`,
      silent: userOptions.silent ?? false,
      debug: userOptions.debug ?? false,
    });

    try {
      const dotenvFile = fs.readFileSync(
        path.join(process.cwd(), ".env.sentry-build-plugin"),
        "utf-8"
      );
      // NOTE: Do not use the dotenv.config API directly to read the dotenv file! For some ungodly reason, it falls back to reading `${process.cwd()}/.env` which is absolutely not what we want.
      const dotenvResult = dotenv.parse(dotenvFile);
      process.env = { ...process.env, ...dotenvResult };
      logger.info('Using environment variables configured in ".env.sentry-build-plugin".');
    } catch (e: unknown) {
      // Ignore "file not found" errors but throw all others
      if (typeof e === "object" && e && "code" in e && e.code !== "ENOENT") {
        throw e;
      }
    }

    const options = normalizeUserOptions(userOptions);

    if (unpluginMetaContext.watchMode || options.disable) {
      return [
        {
          name: "sentry-noop-plugin",
        },
      ];
    }

    const shouldSendTelemetry = allowedToSendTelemetry(options);
    const { sentryHub, sentryClient } = createSentryInstance(
      options,
      shouldSendTelemetry,
      unpluginMetaContext.framework
    );
    const sentrySession = sentryHub.startSession();
    sentryHub.captureSession();

    let sentEndSession = false; // Just to prevent infinite loops with beforeExit, which is called whenever the event loop empties out
    // We also need to manually end sesisons on errors because beforeExit is not called on crashes
    process.on("beforeExit", () => {
      if (!sentEndSession) {
        sentryHub.endSession();
        sentEndSession = true;
      }
    });

    // Set the User-Agent that Sentry CLI will use when interacting with Sentry
    process.env[
      "SENTRY_PIPELINE"
    ] = `${unpluginMetaContext.framework}-plugin/${__PACKAGE_VERSION__}`;

    function handleRecoverableError(unknownError: unknown) {
      sentrySession.status = "abnormal";
      try {
        if (options.errorHandler) {
          try {
            if (unknownError instanceof Error) {
              options.errorHandler(unknownError);
            } else {
              options.errorHandler(new Error("An unknown error occured"));
            }
          } catch (e) {
            sentrySession.status = "crashed";
            throw e;
          }
        } else {
          sentrySession.status = "crashed";
          throw unknownError;
        }
      } finally {
        sentryHub.endSession();
      }
    }

    if (!validateOptions(options, logger)) {
      handleRecoverableError(
        new Error("Options were not set correctly. See output above for more details.")
      );
    }

    if (process.cwd().match(/\\node_modules\\|\/node_modules\//)) {
      logger.warn(
        "Running Sentry plugin from within a `node_modules` folder. Some features may not work."
      );
    }

    const plugins: UnpluginOptions[] = [];

    plugins.push(
      telemetryPlugin({
        sentryClient,
        sentryHub,
        logger,
        shouldSendTelemetry,
      })
    );

    if (options.bundleSizeOptimizations) {
      const { bundleSizeOptimizations } = options;
      const replacementValues: SentrySDKBuildFlags = {};

      if (bundleSizeOptimizations.excludeDebugStatements) {
        replacementValues["__SENTRY_DEBUG__"] = false;
      }
      if (bundleSizeOptimizations.excludePerformanceMonitoring) {
        replacementValues["__SENTRY_TRACE__"] = false;
      }
      if (bundleSizeOptimizations.excludeReplayCanvas) {
        replacementValues["__RRWEB_EXCLUDE_CANVAS__"] = true;
      }
      if (bundleSizeOptimizations.excludeReplayIframe) {
        replacementValues["__RRWEB_EXCLUDE_IFRAME__"] = true;
      }
      if (bundleSizeOptimizations.excludeReplayShadowDom) {
        replacementValues["__RRWEB_EXCLUDE_SHADOW_DOM__"] = true;
      }
      if (bundleSizeOptimizations.excludeReplayWorker) {
        replacementValues["__SENTRY_EXCLUDE_REPLAY_WORKER__"] = true;
      }

      if (Object.keys(replacementValues).length > 0) {
        plugins.push(bundleSizeOptimizationsPlugin(replacementValues));
      }
    }

    if (!options.release.inject) {
      logger.debug(
        "Release injection disabled via `release.inject` option. Will not inject release."
      );
    } else if (!options.release.name) {
      logger.warn(
        "No release name provided. Will not inject release. Please set the `release.name` option to identify your release."
      );
    } else {
      const injectionCode = generateGlobalInjectorCode({
        release: options.release.name,
        injectBuildInformation: options._experiments.injectBuildInformation || false,
      });
      plugins.push(releaseInjectionPlugin(injectionCode));
    }

    if (moduleMetadataInjectionPlugin && options._experiments.moduleMetadata) {
      let metadata: object;
      if (typeof options._experiments.moduleMetadata === "function") {
        const args = {
          org: options.org,
          project: options.project,
          release: options.release.name,
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        metadata = options._experiments.moduleMetadata(args);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        metadata = options._experiments.moduleMetadata;
      }

      const injectionCode = generateModuleMetadataInjectorCode(metadata);
      plugins.push(moduleMetadataInjectionPlugin(injectionCode));
    } else if (options._experiments.moduleMetadata) {
      logger.warn("'moduleMetadata' is currently only supported by '@sentry/webpack-plugin'");
    }

    if (!options.release.name) {
      logger.warn(
        "No release name provided. Will not create release. Please set the `release.name` option to identify your release."
      );
    } else if (!options.authToken) {
      logger.warn(
        "No auth token provided. Will not create release. Please set the `authToken` option. You can find information on how to generate a Sentry auth token here: https://docs.sentry.io/api/auth/"
      );
    } else if (!options.org && !options.authToken.startsWith("sntrys_")) {
      logger.warn(
        "No organization slug provided. Will not create release. Please set the `org` option to your Sentry organization slug."
      );
    } else if (!options.project) {
      logger.warn(
        "No project provided. Will not create release. Please set the `project` option to your Sentry project slug."
      );
    } else {
      plugins.push(
        releaseManagementPlugin({
          logger,
          releaseName: options.release.name,
          shouldCreateRelease: options.release.create,
          shouldCleanArtifacts: options.release.cleanArtifacts,
          shouldFinalizeRelease: options.release.finalize,
          include: options.release.uploadLegacySourcemaps,
          setCommitsOption: options.release.setCommits,
          deployOptions: options.release.deploy,
          dist: options.release.dist,
          handleRecoverableError: handleRecoverableError,
          sentryHub,
          sentryClient,
          sentryCliOptions: {
            authToken: options.authToken,
            org: options.org,
            project: options.project,
            silent: options.silent,
            url: options.url,
            vcsRemote: options.release.vcsRemote,
            headers: options.headers,
          },
        })
      );
    }

    plugins.push(debugIdInjectionPlugin());

    if (!options.authToken) {
      logger.warn(
        "No auth token provided. Will not upload source maps. Please set the `authToken` option. You can find information on how to generate a Sentry auth token here: https://docs.sentry.io/api/auth/"
      );
    } else if (!options.org && !options.authToken.startsWith("sntrys_")) {
      logger.warn(
        "No org provided. Will not upload source maps. Please set the `org` option to your Sentry organization slug."
      );
    } else if (!options.project) {
      logger.warn(
        "No project provided. Will not upload source maps. Please set the `project` option to your Sentry project slug."
      );
    } else {
      plugins.push(
        debugIdUploadPlugin(
          createDebugIdUploadFunction({
            assets: options.sourcemaps?.assets,
            ignore: options.sourcemaps?.ignore,
            filesToDeleteAfterUpload:
              options.sourcemaps?.filesToDeleteAfterUpload ??
              options.sourcemaps?.deleteFilesAfterUpload,
            dist: options.release.dist,
            releaseName: options.release.name,
            logger: logger,
            handleRecoverableError: handleRecoverableError,
            rewriteSourcesHook: options.sourcemaps?.rewriteSources,
            sentryHub,
            sentryClient,
            sentryCliOptions: {
              authToken: options.authToken,
              org: options.org,
              project: options.project,
              silent: options.silent,
              url: options.url,
              vcsRemote: options.release.vcsRemote,
              headers: options.headers,
            },
          })
        )
      );
    }

    if (options.reactComponentAnnotation) {
      if (!options.reactComponentAnnotation.enabled) {
        logger.debug(
          "The component name annotate plugin is currently disabled. Skipping component name annotations."
        );
      } else if (options.reactComponentAnnotation.enabled && !componentNameAnnotatePlugin) {
        logger.warn(
          "The component name annotate plugin is currently not supported by '@sentry/esbuild-plugin'"
        );
      } else {
        componentNameAnnotatePlugin && plugins.push(componentNameAnnotatePlugin());
      }
    }

    return plugins;
  });
}

export function getBuildInformation() {
  const packageJson = getPackageJson();

  const { deps, depsVersions } = packageJson
    ? getDependencies(packageJson)
    : { deps: [], depsVersions: {} };

  return {
    deps,
    depsVersions,
    nodeVersion: parseMajorVersion(process.version),
  };
}

/**
 * Determines whether the Sentry CLI binary is in its expected location.
 * This function is useful since `@sentry/cli` installs the binary via a post-install
 * script and post-install scripts may not always run. E.g. with `npm i --ignore-scripts`.
 */
export function sentryCliBinaryExists(): boolean {
  return fs.existsSync(SentryCli.getPath());
}

export function createRollupReleaseInjectionHooks(injectionCode: string) {
  const virtualReleaseInjectionFileId = "\0sentry-release-injection-file";
  return {
    resolveId(id: string) {
      if (id === virtualReleaseInjectionFileId) {
        return {
          id: virtualReleaseInjectionFileId,
          external: false,
          moduleSideEffects: true,
        };
      } else {
        return null;
      }
    },

    load(id: string) {
      if (id === virtualReleaseInjectionFileId) {
        return injectionCode;
      } else {
        return null;
      }
    },

    transform(code: string, id: string) {
      if (id === virtualReleaseInjectionFileId) {
        return null;
      }

      // id may contain query and hash which will trip up our file extension logic below
      const idWithoutQueryAndHash = stripQueryAndHashFromPath(id);

      if (idWithoutQueryAndHash.match(/\\node_modules\\|\/node_modules\//)) {
        return null;
      }

      if (
        ![".js", ".ts", ".jsx", ".tsx", ".mjs"].some((ending) =>
          idWithoutQueryAndHash.endsWith(ending)
        )
      ) {
        return null;
      }

      const ms = new MagicString(code);

      // Appending instead of prepending has less probability of mucking with user's source maps.
      // Luckily import statements get hoisted to the top anyways.
      ms.append(`\n\n;import "${virtualReleaseInjectionFileId}";`);

      return {
        code: ms.toString(),
        map: ms.generateMap({ hires: true }),
      };
    },
  };
}

export function createRollupBundleSizeOptimizationHooks(replacementValues: SentrySDKBuildFlags) {
  return {
    transform(code: string) {
      return replaceBooleanFlagsInCode(code, replacementValues);
    },
  };
}

// We need to be careful not to inject the snippet before any `"use strict";`s.
// As an additional complication `"use strict";`s may come after any number of comments.
const COMMENT_USE_STRICT_REGEX =
  // Note: CodeQL complains that this regex potentially has n^2 runtime. This likely won't affect realistic files.
  /^(?:\s*|\/\*(?:.|\r|\n)*?\*\/|\/\/.*[\n\r])*(?:"[^"]*";|'[^']*';)?/;

export function createRollupDebugIdInjectionHooks() {
  return {
    renderChunk(code: string, chunk: { fileName: string }) {
      if (
        [".js", ".mjs", ".cjs"].some((ending) => chunk.fileName.endsWith(ending)) // chunks could be any file (html, md, ...)
      ) {
        const debugId = stringToUUID(code); // generate a deterministic debug ID
        const codeToInject = getDebugIdSnippet(debugId);

        const ms = new MagicString(code, { filename: chunk.fileName });

        const match = code.match(COMMENT_USE_STRICT_REGEX)?.[0];

        if (match) {
          // Add injected code after any comments or "use strict" at the beginning of the bundle.
          ms.appendLeft(match.length, codeToInject);
        } else {
          // ms.replace() doesn't work when there is an empty string match (which happens if
          // there is neither, a comment, nor a "use strict" at the top of the chunk) so we
          // need this special case here.
          ms.prepend(codeToInject);
        }

        return {
          code: ms.toString(),
          map: ms.generateMap({ file: chunk.fileName, hires: true }),
        };
      } else {
        return null; // returning null means not modifying the chunk at all
      }
    },
  };
}

export function createRollupModuleMetadataInjectionHooks(injectionCode: string) {
  return {
    renderChunk(code: string, chunk: { fileName: string }) {
      if (
        [".js", ".mjs", ".cjs"].some((ending) => chunk.fileName.endsWith(ending)) // chunks could be any file (html, md, ...)
      ) {
        const ms = new MagicString(code, { filename: chunk.fileName });

        const match = code.match(COMMENT_USE_STRICT_REGEX)?.[0];

        if (match) {
          // Add injected code after any comments or "use strict" at the beginning of the bundle.
          ms.appendLeft(match.length, injectionCode);
        } else {
          // ms.replace() doesn't work when there is an empty string match (which happens if
          // there is neither, a comment, nor a "use strict" at the top of the chunk) so we
          // need this special case here.
          ms.prepend(injectionCode);
        }

        return {
          code: ms.toString(),
          map: ms.generateMap({ file: chunk.fileName, hires: true }),
        };
      } else {
        return null; // returning null means not modifying the chunk at all
      }
    },
  };
}

export function createRollupDebugIdUploadHooks(
  upload: (buildArtifacts: string[]) => Promise<void>
) {
  return {
    async writeBundle(
      outputOptions: { dir?: string; file?: string },
      bundle: { [fileName: string]: unknown }
    ) {
      if (outputOptions.dir) {
        const outputDir = outputOptions.dir;
        const buildArtifacts = await glob(
          ["/**/*.js", "/**/*.js.map", "/**/*.mjs.map", "/**/*.cjs.map"],
          {
            root: outputDir,
            absolute: true,
            nodir: true,
          }
        );
        await upload(buildArtifacts);
      } else if (outputOptions.file) {
        await upload([outputOptions.file]);
      } else {
        const buildArtifacts = Object.keys(bundle).map((asset) => path.join(path.resolve(), asset));
        await upload(buildArtifacts);
      }
    },
  };
}

export function createComponentNameAnnotateHooks() {
  type ParserPlugins = NonNullable<
    NonNullable<Parameters<typeof transformAsync>[1]>["parserOpts"]
  >["plugins"];

  return {
    async transform(this: void, code: string, id: string): Promise<TransformResult> {
      // id may contain query and hash which will trip up our file extension logic below
      const idWithoutQueryAndHash = stripQueryAndHashFromPath(id);

      if (idWithoutQueryAndHash.match(/\\node_modules\\|\/node_modules\//)) {
        return null;
      }

      // We will only apply this plugin on jsx and tsx files
      if (![".jsx", ".tsx"].some((ending) => idWithoutQueryAndHash.endsWith(ending))) {
        return null;
      }

      const parserPlugins: ParserPlugins = [];
      if (idWithoutQueryAndHash.endsWith(".jsx")) {
        parserPlugins.push("jsx");
      } else if (idWithoutQueryAndHash.endsWith(".tsx")) {
        parserPlugins.push("jsx", "typescript");
      }

      try {
        const result = await transformAsync(code, {
          plugins: [[componentNameAnnotatePlugin]],
          filename: id,
          parserOpts: {
            sourceType: "module",
            allowAwaitOutsideFunction: true,
            plugins: parserPlugins,
          },
          generatorOpts: {
            decoratorsBeforeExport: true,
          },
          sourceMaps: true,
        });

        return {
          code: result?.code ?? code,
          map: result?.map,
        };
      } catch (e) {
        logger.error(`Failed to apply react annotate plugin`, e);
      }

      return { code };
    },
  };
}

export function getDebugIdSnippet(debugId: string): string {
  return `;!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="${debugId}",e._sentryDebugIdIdentifier="sentry-dbid-${debugId}")}catch(e){}}();`;
}

export { stringToUUID, replaceBooleanFlagsInCode } from "./utils";

export type { Options, SentrySDKBuildFlags } from "./types";
