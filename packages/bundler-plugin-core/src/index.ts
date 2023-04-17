import { createUnplugin, UnpluginOptions } from "unplugin";
import MagicString from "magic-string";
import { Options, BuildContext } from "./types";
import {
  createNewRelease,
  cleanArtifacts,
  addDeploy,
  finalizeRelease,
  setCommits,
  uploadSourceMaps,
  uploadDebugIdSourcemaps,
} from "./sentry/releasePipeline";
import "@sentry/tracing";
import SentryCli from "@sentry/cli";
import {
  addPluginOptionInformationToHub,
  addSpanToTransaction,
  makeSentryClient,
  shouldSendTelemetry,
} from "./sentry/telemetry";
import { Span, Transaction } from "@sentry/types";
import { createLogger, Logger } from "./sentry/logger";
import { NormalizedOptions, normalizeUserOptions, validateOptions } from "./options-mapping";
import { getSentryCli } from "./sentry/cli";
import { makeMain } from "@sentry/node";
import os from "os";
import path from "path";
import fs from "fs";
import { createRequire } from "module";
import { promisify } from "util";
import { getDependencies, getPackageJson, parseMajorVersion, stringToUUID } from "./utils";
import { glob } from "glob";
import { injectDebugIdSnippetIntoChunk, prepareBundleForDebugIdUpload } from "./debug-id";
import webpackSources from "webpack-sources";
import type { sources } from "webpack";

const ALLOWED_TRANSFORMATION_FILE_ENDINGS = [".js", ".ts", ".jsx", ".tsx", ".mjs"];

// Use createRequire because esm doesn't like built-in require.resolve
const require = createRequire(import.meta.url);

const releaseInjectionFilePath = require.resolve(
  "@sentry/bundler-plugin-core/sentry-release-injection-file"
);

const esbuildDebugIdInjectionFilePath = require.resolve(
  "@sentry/bundler-plugin-core/sentry-esbuild-debugid-injection-file"
);

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
const unplugin = createUnplugin<Options, true>((userOptions, unpluginMetaContext) => {
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

  const releaseNamePromise = new Promise<string>((resolve) => {
    if (userOptions.release) {
      resolve(userOptions.release);
    } else {
      resolve(cli.releases.proposeVersion());
    }
  });

  let transaction: Transaction | undefined;
  let releaseInjectionSpan: Span | undefined;

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

      const releaseName = await releaseNamePromise;

      // At this point, we either have determined a release or we have to bail
      if (!releaseName) {
        handleError(
          new Error(
            "Unable to determine a release name. Make sure to set the `release` option or use an environment that supports auto-detection https://docs.sentry.io/cli/releases/#creating-releases`"
          ),
          logger,
          options.errorHandler
        );
      }

      transaction = sentryHub.startTransaction({
        op: "function.plugin",
        name: "Sentry Bundler Plugin execution",
      });

      releaseInjectionSpan = addSpanToTransaction(
        { hub: sentryHub, parentSpan: transaction, logger, cli },
        "function.plugin.inject_release",
        "Release injection"
      );
    },

    /**
     * Responsible for returning the "sentry-release-injector" ID when we encounter it. We return the ID so load is
     * called and we can "virtually" load the module. See `load` hook for more info on why it's virtual.
     *
     * We also record the id (i.e. absolute path) of any non-entrypoint.
     *
     * @param id For imports: The absolute path of the module to be imported. For entrypoints: The path the user defined as entrypoint - may also be relative.
     * @param importer For imports: The absolute path of the module that imported this module. For entrypoints: `undefined`.
     * @param options Additional information to use for making a resolving decision.
     * @returns `"sentry-release-injector"` when the imported file is called `"sentry-release-injector"`. Otherwise returns `undefined`.
     */
    resolveId(id, importer, { isEntry }) {
      logger.debug('Called "resolveId":', { id, importer, isEntry });
      return undefined;
    },

    /**
     * This hook determines whether we want to transform a module. In the sentry bundler plugin we want to transform every entrypoint
     * unless configured otherwise with the `releaseInjectionTargets` option.
     *
     * @param id Always the absolute (fully resolved) path to the module.
     * @returns `true` or `false` depending on whether we want to transform the module. For the sentry bundler plugin we only
     * want to transform the release injector file.
     */
    transformInclude(id) {
      logger.debug('Called "transformInclude":', { id });

      if (id.includes("sentry-release-injection-file")) {
        return true;
      }

      if (id.match(/\\node_modules\\|\/node_modules\//)) {
        return false; // never transform 3rd party modules
      }

      // We normalize the id because vite always passes `id` as a unix style path which causes problems when a user passes
      // a windows style path to `releaseInjectionTargets`
      const normalizedId = path.normalize(id);

      if (options.releaseInjectionTargets) {
        // If there's an `releaseInjectionTargets` option transform (ie. inject the release varible) when the file path matches the option.
        if (typeof options.releaseInjectionTargets === "function") {
          return options.releaseInjectionTargets(normalizedId);
        }

        return options.releaseInjectionTargets.some((entry) => {
          if (entry instanceof RegExp) {
            return entry.test(normalizedId);
          } else {
            const normalizedEntry = path.normalize(entry);
            return normalizedId === normalizedEntry;
          }
        });
      } else {
        const pathIsOrdinary = !normalizedId.includes("?") && !normalizedId.includes("#");

        const pathHasAllowedFileEnding = ALLOWED_TRANSFORMATION_FILE_ENDINGS.some(
          (allowedFileEnding) => normalizedId.endsWith(allowedFileEnding)
        );

        return pathIsOrdinary && pathHasAllowedFileEnding;
      }
    },

    /**
     * This hook is responsible for injecting the "sentry release injector" imoprt statement into each entrypoint unless
     * configured otherwise with the `releaseInjectionTargets` option (logic for that is in the `transformInclude` hook).
     *
     * @param code Code of the file to transform.
     * @param id Always the absolute (fully resolved) path to the module.
     * @returns transformed code + source map
     */
    async transform(code, id) {
      logger.debug('Called "transform":', { id });

      if (!options.injectRelease) {
        return;
      }

      // The MagicString library allows us to generate sourcemaps for the changes we make to the user code.
      const ms = new MagicString(code);

      if (code.includes("_sentry_release_injection_file")) {
        // Appending instead of prepending has less probability of mucking with user's source maps.
        ms.append(
          generateGlobalInjectorCode({
            release: await releaseNamePromise,
            injectReleasesMap: options.injectReleasesMap,
            injectBuildInformation: options._experiments.injectBuildInformation || false,
            org: options.org,
            project: options.project,
          })
        );
      } else {
        // Appending instead of prepending has less probability of mucking with user's source maps.
        // Luckily import statements get hoisted to the top anyways.
        // The import needs to be an absolute path because Rollup doesn't bundle stuff in `node_modules` by default when bundling CJS (unless the import path is absolute or the node-resolve-plugin is used).
        ms.append(`;\nimport "${releaseInjectionFilePath.replace(/\\/g, "\\\\")}";`);
      }

      if (unpluginMetaContext.framework === "esbuild") {
        // esbuild + unplugin is buggy at the moment when we return an object with a `map` (sourcemap) property.
        // Currently just returning a string here seems to work and even correctly sourcemaps the code we generate.
        // However, other bundlers need the `map` property
        return ms.toString();
      } else {
        return {
          code: ms.toString(),
          map: ms.generateMap(),
        };
      }
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

      const releaseName = await releaseNamePromise;

      let tmpUploadFolder: string | undefined;

      try {
        if (!unpluginMetaContext.watchMode) {
          if (options.sourcemaps?.assets) {
            const debugIdChunkFilePaths = (
              await glob(options.sourcemaps.assets, {
                absolute: true,
                nodir: true,
                ignore: options.sourcemaps.ignore,
              })
            ).filter((p) => p.endsWith(".js") || p.endsWith(".mjs") || p.endsWith(".cjs"));

            if (unpluginMetaContext.framework === "esbuild") {
              await Promise.all(
                debugIdChunkFilePaths.map(async (debugIdChunkFilePath) => {
                  const chunkFileContents = await promisify(fs.readFile)(
                    debugIdChunkFilePath,
                    "utf-8"
                  );

                  const debugId = stringToUUID(chunkFileContents);

                  const newChunkFileContents = chunkFileContents.replace(
                    /__SENTRY_DEBUG_ID__/g,
                    debugId
                  );

                  await promisify(fs.writeFile)(
                    debugIdChunkFilePath,
                    newChunkFileContents,
                    "utf-8"
                  );
                })
              );
            }

            const sourceFileUploadFolderPromise = promisify(fs.mkdtemp)(
              path.join(os.tmpdir(), "sentry-bundler-plugin-upload-")
            );

            await Promise.all(
              debugIdChunkFilePaths.map(async (chunkFilePath, chunkIndex): Promise<void> => {
                await prepareBundleForDebugIdUpload(
                  chunkFilePath,
                  await sourceFileUploadFolderPromise,
                  String(chunkIndex),
                  logger
                );
              })
            );

            tmpUploadFolder = await sourceFileUploadFolderPromise;
            await uploadDebugIdSourcemaps(options, ctx, tmpUploadFolder, releaseName);
          }

          await createNewRelease(options, ctx, releaseName);
          await cleanArtifacts(options, ctx, releaseName);
          await uploadSourceMaps(options, ctx, releaseName);
          await setCommits(options, ctx, releaseName);
          await finalizeRelease(options, ctx, releaseName);
          await addDeploy(options, ctx, releaseName);
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
    rollup: {
      renderChunk(code, chunk) {
        if (
          options.sourcemaps?.assets &&
          [".js", ".mjs", ".cjs"].some((ending) => chunk.fileName.endsWith(ending)) // chunks could be any file (html, md, ...)
        ) {
          return injectDebugIdSnippetIntoChunk(code);
        } else {
          return null; // returning null means not modifying the chunk at all
        }
      },
    },
    vite: {
      renderChunk(code, chunk) {
        if (
          options.sourcemaps?.assets &&
          [".js", ".mjs", ".cjs"].some((ending) => chunk.fileName.endsWith(ending)) // chunks could be any file (html, md, ...)
        ) {
          return injectDebugIdSnippetIntoChunk(code);
        } else {
          return null; // returning null means not modifying the chunk at all
        }
      },
    },
    webpack(compiler) {
      if (options.sourcemaps?.assets) {
        // Cache inspired by https://github.com/webpack/webpack/pull/15454
        const cache = new WeakMap<sources.Source, sources.Source>();

        compiler.hooks.compilation.tap("sentry-plugin", (compilation) => {
          compilation.hooks.optimizeChunkAssets.tap("sentry-plugin", (chunks) => {
            chunks.forEach((chunk) => {
              const fileNames = chunk.files;
              fileNames.forEach((fileName) => {
                const source = compilation.assets[fileName];

                if (!source) {
                  logger.warn(
                    "Unable to access compilation assets. If you see this warning, it is likely a bug in the Sentry webpack plugin. Feel free to open an issue at https://github.com/getsentry/sentry-javascript-bundler-plugins with reproduction steps."
                  );
                  return;
                }

                compilation.updateAsset(fileName, (oldSource) => {
                  const cached = cache.get(oldSource);
                  if (cached) {
                    return cached;
                  }

                  const originalCode = source.source().toString();

                  // The source map type is very annoying :(
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
                  const originalSourceMap = source.map() as any;

                  const { code: newCode, map: newSourceMap } = injectDebugIdSnippetIntoChunk(
                    originalCode,
                    fileName
                  );

                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  newSourceMap.sources = originalSourceMap.sources as string[];

                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  newSourceMap.sourcesContent = originalSourceMap.sourcesContent as string[];

                  const newSource = new webpackSources.SourceMapSource(
                    newCode,
                    fileName,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    originalSourceMap,
                    originalCode,
                    newSourceMap,
                    false
                  ) as sources.Source;

                  cache.set(oldSource, newSource);

                  return newSource;
                });
              });
            });
          });
        });
      }
    },
  });

  if (unpluginMetaContext.framework === "esbuild") {
    if (options.sourcemaps?.assets) {
      plugins.push({
        name: "sentry-esbuild-debug-id-plugin",
        esbuild: {
          setup({ initialOptions }) {
            initialOptions.inject = initialOptions.inject || [];
            initialOptions.inject.push(esbuildDebugIdInjectionFilePath);
          },
        },
      });
    }
  }

  return plugins;
});

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

/**
 * Generates code for the global injector which is responsible for setting the global
 * `SENTRY_RELEASE` & `SENTRY_BUILD_INFO` variables.
 */
function generateGlobalInjectorCode({
  release,
  injectReleasesMap,
  injectBuildInformation,
  org,
  project,
}: {
  release: string;
  injectReleasesMap: boolean;
  injectBuildInformation: boolean;
  org?: string;
  project?: string;
}) {
  // The code below is mostly ternary operators because it saves bundle size.
  // The checks are to support as many environments as possible. (Node.js, Browser, webworkers, etc.)
  let code = `
    var _global =
      typeof window !== 'undefined' ?
        window :
        typeof global !== 'undefined' ?
          global :
          typeof self !== 'undefined' ?
            self :
            {};

    _global.SENTRY_RELEASE={id:"${release}"};`;

  if (injectReleasesMap && project) {
    const key = org ? `${project}@${org}` : project;
    code += `
      _global.SENTRY_RELEASES=_global.SENTRY_RELEASES || {};
      _global.SENTRY_RELEASES["${key}"]={id:"${release}"};`;
  }

  if (injectBuildInformation) {
    const buildInfo = getBuildInformation();

    code += `
      _global.SENTRY_BUILD_INFO=${JSON.stringify(buildInfo)};`;
  }

  return code;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryVitePlugin: (options: Options) => any = unplugin.vite;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryRollupPlugin: (options: Options) => any = unplugin.rollup;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryWebpackPlugin: (options: Options) => any = unplugin.webpack;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryEsbuildPlugin: (options: Options) => any = unplugin.esbuild;

export type { Options } from "./types";
