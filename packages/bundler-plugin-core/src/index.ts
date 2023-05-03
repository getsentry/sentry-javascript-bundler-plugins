import SentryCli from "@sentry/cli";
import { makeMain } from "@sentry/node";
import { Span, Transaction } from "@sentry/types";
import fs from "fs";
import MagicString from "magic-string";
import { createUnplugin, UnpluginOptions } from "unplugin";
import { NormalizedOptions, normalizeUserOptions, validateOptions } from "./options-mapping";
import { debugIdUploadPlugin } from "./plugins/debug-id-upload";
import { getSentryCli } from "./sentry/cli";
import { createLogger, Logger } from "./sentry/logger";
import {
  addDeploy,
  cleanArtifacts,
  createNewRelease,
  finalizeRelease,
  setCommits,
  uploadSourceMaps,
} from "./sentry/releasePipeline";
import {
  addPluginOptionInformationToHub,
  addSpanToTransaction,
  makeSentryClient,
  shouldSendTelemetry,
} from "./sentry/telemetry";
import { BuildContext, Options } from "./types";
import {
  determineReleaseName,
  generateGlobalInjectorCode,
  getDependencies,
  getPackageJson,
  parseMajorVersion,
  stringToUUID,
} from "./utils";

interface SentryUnpluginFactoryOptions {
  releaseInjectionPlugin: (injectionCode: string) => UnpluginOptions;
  debugIdInjectionPlugin: () => UnpluginOptions;
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
  debugIdInjectionPlugin,
}: SentryUnpluginFactoryOptions) {
  return createUnplugin<Options, true>((userOptions, unpluginMetaContext) => {
    const options = normalizeUserOptions(userOptions);

    const allowedToSendTelemetryPromise = shouldSendTelemetry(options);

    const { sentryHub, sentryClient } = makeSentryClient(
      "https://4c2bae7d9fbc413e8f7385f55c515d51@o1.ingest.sentry.io/6690737",
      allowedToSendTelemetryPromise,
      options.project
    );

    addPluginOptionInformationToHub(options, sentryHub, unpluginMetaContext.framework);

    //TODO: This call is problematic because as soon as we set our hub as the current hub
    //      we might interfere with other plugins that use Sentry. However, for now, we'll
    //      leave it in because without it, we can't get distributed traces (which are pretty nice)
    //      Let's keep it until someone complains about interference.
    //      The ideal solution would be a code change in the JS SDK but it's not a straight-forward fix.
    makeMain(sentryHub);

    const logger = createLogger({
      prefix: `[sentry-${unpluginMetaContext.framework}-plugin]`,
      silent: options.silent,
      debug: options.debug,
    });

    if (!validateOptions(options, logger)) {
      handleError(
        new Error("Options were not set correctly. See output above for more details."),
        logger,
        options.errorHandler
      );
    }

    const cli = getSentryCli(options, logger);

    let transaction: Transaction | undefined;
    let releaseInjectionSpan: Span | undefined;

    const releaseName = options.release ?? determineReleaseName();
    if (!releaseName) {
      handleError(
        new Error("Unable to determine a release name. Please set the `release` option."),
        logger,
        options.errorHandler
      );
    }

    const plugins: UnpluginOptions[] = [];

    plugins.push({
      name: "sentry-plugin",
      enforce: "pre", // needed for Vite to call resolveId hook

      /**
       * Responsible for starting the plugin execution transaction and the release injection span
       */
      async buildStart() {
        logger.debug("Called 'buildStart'");

        const isAllowedToSendToSendTelemetry = await allowedToSendTelemetryPromise;
        if (isAllowedToSendToSendTelemetry) {
          logger.info("Sending error and performance telemetry data to Sentry.");
          logger.info("To disable telemetry, set `options.telemetry` to `false`.");
          sentryHub.addBreadcrumb({ level: "info", message: "Telemetry enabled." });
        } else {
          sentryHub.addBreadcrumb({
            level: "info",
            message: "Telemetry disabled. This should never show up in a Sentry event.",
          });
        }

        if (process.cwd().match(/\\node_modules\\|\/node_modules\//)) {
          logger.warn(
            "Running Sentry plugin from within a `node_modules` folder. Some features may not work."
          );
        }

        transaction = sentryHub.startTransaction({
          op: "function.plugin",
          name: "Sentry Bundler Plugin execution",
        });
      },

      /**
       * Responsible for executing the sentry release creation pipeline (i.e. creating a release on
       * Sentry.io, uploading sourcemaps, associating commits and deploys and finalizing the release)
       */
      async writeBundle() {
        logger.debug('Called "writeBundle"');

        releaseInjectionSpan?.finish();
        const releasePipelineSpan =
          transaction &&
          addSpanToTransaction(
            { hub: sentryHub, parentSpan: transaction, logger, cli },
            "function.plugin.release",
            "Release pipeline"
          );

        sentryHub.addBreadcrumb({
          category: "writeBundle:start",
          level: "info",
        });

        const ctx: BuildContext = { hub: sentryHub, parentSpan: releasePipelineSpan, logger, cli };

        let tmpUploadFolder: string | undefined;

        try {
          if (!unpluginMetaContext.watchMode) {
            if (releaseName) {
              await createNewRelease(options, ctx, releaseName);
              await cleanArtifacts(options, ctx, releaseName);
              await uploadSourceMaps(options, ctx, releaseName);
              await setCommits(options, ctx, releaseName);
              await finalizeRelease(options, ctx, releaseName);
              await addDeploy(options, ctx, releaseName);
            } else {
              logger.warn("No release value provided. Will not upload source maps.");
            }
          }
          transaction?.setStatus("ok");
        } catch (e: unknown) {
          transaction?.setStatus("cancelled");
          sentryHub.addBreadcrumb({
            level: "error",
            message: "Error during writeBundle",
          });
          handleError(e, logger, options.errorHandler);
        } finally {
          if (tmpUploadFolder) {
            fs.rm(tmpUploadFolder, { recursive: true, force: true }, () => {
              // We don't care if this errors
            });
          }
          releasePipelineSpan?.finish();
          transaction?.finish();
          await sentryClient.flush().then(null, () => {
            logger.warn("Sending of telemetry failed");
          });
        }

        sentryHub.addBreadcrumb({
          category: "writeBundle:finish",
          level: "info",
        });
      },
    });

    if (options.injectRelease && releaseName) {
      const injectionCode = generateGlobalInjectorCode({
        release: releaseName,
        injectReleasesMap: options.injectReleasesMap,
        injectBuildInformation: options._experiments.injectBuildInformation || false,
        org: options.org,
        project: options.project,
      });

      plugins.push(releaseInjectionPlugin(injectionCode));
    }

    if (!unpluginMetaContext.watchMode && options.sourcemaps?.assets !== undefined) {
      plugins.push(
        debugIdUploadPlugin({
          assets: options.sourcemaps.assets,
          ignore: options.sourcemaps.ignore,
          dist: options.dist,
          releaseName: releaseName,
          logger: logger,
          cliInstance: cli,
        })
      );
    }

    if (options.sourcemaps?.assets) {
      plugins.push(debugIdInjectionPlugin());
    }

    return plugins;
  });
}

function handleError(
  unknownError: unknown,
  logger: Logger,
  errorHandler: NormalizedOptions["errorHandler"]
) {
  if (unknownError instanceof Error) {
    logger.error(unknownError.message);
  } else {
    logger.error(String(unknownError));
  }

  if (errorHandler) {
    if (unknownError instanceof Error) {
      errorHandler(unknownError);
    } else {
      errorHandler(new Error("An unknown error occured"));
    }
  } else {
    throw unknownError;
  }
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

      if (id.match(/\\node_modules\\|\/node_modules\//)) {
        return null;
      }

      if (![".js", ".ts", ".jsx", ".tsx", ".mjs"].some((ending) => id.endsWith(ending))) {
        return null;
      }

      const ms = new MagicString(code);

      // Appending instead of prepending has less probability of mucking with user's source maps.
      // Luckily import statements get hoisted to the top anyways.
      ms.append(`\n\n;import "${virtualReleaseInjectionFileId}";`);

      return {
        code: ms.toString(),
        map: ms.generateMap(),
      };
    },
  };
}

export function createRollupDebugIdInjectionHooks() {
  return {
    renderChunk(code: string, chunk: { fileName: string }) {
      if (
        [".js", ".mjs", ".cjs"].some((ending) => chunk.fileName.endsWith(ending)) // chunks could be any file (html, md, ...)
      ) {
        const debugId = stringToUUID(code); // generate a deterministic debug ID
        const codeToInject = getDebugIdSnippet(debugId);

        const ms = new MagicString(code, { filename: chunk.fileName });

        // We need to be careful not to inject the snippet before any `"use strict";`s.
        // As an additional complication `"use strict";`s may come after any number of comments.
        const commentUseStrictRegex =
          // Note: CodeQL complains that this regex potentially has n^2 runtime. This likely won't affect realistic files.
          /^(?:\s*|\/\*(?:.|\r|\n)*\*\/|\/\/.*[\n\r])*(?:"[^"]*";|'[^']*';)?/;

        if (code.match(commentUseStrictRegex)?.[0]) {
          // Add injected code after any comments or "use strict" at the beginning of the bundle.
          ms.replace(commentUseStrictRegex, (match) => `${match}${codeToInject}`);
        } else {
          // ms.replace() doesn't work when there is an empty string match (which happens if
          // there is neither, a comment, nor a "use strict" at the top of the chunk) so we
          // need this special case here.
          ms.prepend(codeToInject);
        }

        return {
          code: ms.toString(),
          map: ms.generateMap({ file: chunk.fileName }),
        };
      } else {
        return null; // returning null means not modifying the chunk at all
      }
    },
  };
}

export function getDebugIdSnippet(debugId: string): string {
  return `;!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="${debugId}",e._sentryDebugIdIdentifier="sentry-dbid-${debugId}")}catch(e){}}();`;
}

export type { Options } from "./types";
