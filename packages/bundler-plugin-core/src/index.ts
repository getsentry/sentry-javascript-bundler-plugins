import { createUnplugin } from "unplugin";
import MagicString from "magic-string";
import { Options, BuildContext } from "./types";
import {
  createNewRelease,
  cleanArtifacts,
  addDeploy,
  finalizeRelease,
  setCommits,
  uploadSourceMaps,
} from "./sentry/releasePipeline";
import "@sentry/tracing";
import {
  addPluginOptionTags,
  addSpanToTransaction,
  captureMinimalError,
  makeSentryClient,
  turnOffTelemetryForSelfHostedSentry,
} from "./sentry/telemetry";
import { Span, Transaction } from "@sentry/types";
import { createLogger, Logger } from "./sentry/logger";
import { InternalOptions, normalizeUserOptions, validateOptions } from "./options-mapping";
import { getSentryCli } from "./sentry/cli";
import { Hub } from "@sentry/node";

// We prefix the polyfill id with \0 to tell other plugins not to try to load or transform it.
// This hack is taken straight from https://rollupjs.org/guide/en/#resolveid.
// This probably doesn't work for all bundlers but for rollup it does.
const RELEASE_INJECTOR_ID = "\0sentry-release-injector";

const ALLOWED_TRANSFORMATION_FILE_ENDINGS = [".js", ".ts", ".jsx", ".tsx", ".cjs", ".mjs"];

/**
 * The sentry bundler plugin concerns itself with two things:
 * - Release injection
 * - Sourcemaps upload
 *
 * Release injection:
 *
 * Per default the sentry bundler plugin will inject a global `SENTRY_RELEASE` into each JavaScript/TypeScript module
 * that is part of the bundle. On a technical level this is done by appending an import (`import "sentry-release-injector;"`)
 * to all entrypoint files of the user code (see `transformInclude` and `transform` hooks). This import is then resolved
 * by the sentry plugin to a virtual module that sets the global variable (see `resolveId` and `load` hooks).
 * If a user wants to inject the release into a particular set of modules they can use the `releaseInjectionTargets` option.
 *
 * Source maps upload:
 *
 * The sentry bundler plugin will also take care of uploading source maps to Sentry. This is all done in the
 * `writeBundle` hook. In this hook the sentry plugin will execute the release creation pipeline:
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
const unplugin = createUnplugin<Options>((options, unpluginMetaContext) => {
  const internalOptions = normalizeUserOptions(options);

  const { hub: sentryHub } = makeSentryClient(
    "https://4c2bae7d9fbc413e8f7385f55c515d51@o1.ingest.sentry.io/6690737",
    internalOptions.telemetry
  );
  addPluginOptionTags(internalOptions, sentryHub);

  const logger = createLogger({
    hub: sentryHub,
    prefix: `[sentry-${unpluginMetaContext.framework}-plugin]`,
    silent: internalOptions.silent,
    debug: internalOptions.debug,
  });

  if (!validateOptions(internalOptions, logger)) {
    handleError(
      new Error("Options were not set correctly. See output above for more details."),
      logger,
      internalOptions.errorHandler
    );
  }

  const cli = getSentryCli(internalOptions, logger);

  if (internalOptions.telemetry) {
    logger.info("Sending error and performance telemetry data to Sentry.");
    logger.info("To disable telemetry, set `options.telemetry` to `false`.");
  }

  sentryHub.setTags({
    organization: internalOptions.org,
    project: internalOptions.project,
    bundler: unpluginMetaContext.framework,
  });

  sentryHub.setUser({ id: internalOptions.org });

  let transaction: Transaction | undefined;
  let releaseInjectionSpan: Span | undefined;

  return {
    name: "sentry-plugin",
    enforce: "pre", // needed for Vite to call resolveId hook

    /**
     * Responsible for starting the plugin execution transaction and the release injection span
     */
    async buildStart() {
      await turnOffTelemetryForSelfHostedSentry(cli, sentryHub);

      if (!internalOptions.release) {
        internalOptions.release = await cli.releases.proposeVersion();
      }

      // At this point, we either have determined a release or we have to bail
      if (!internalOptions.release) {
        handleError(
          new Error(
            "Unable to determine a release name. Make sure to set the `release` option or use an environment that supports auto-detection https://docs.sentry.io/cli/releases/#creating-releases`"
          ),
          logger,
          internalOptions.errorHandler,
          sentryHub
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
      sentryHub.addBreadcrumb({
        category: "resolveId",
        message: `isEntry: ${String(isEntry)}`,
        level: "info",
      });

      if (id === RELEASE_INJECTOR_ID) {
        return RELEASE_INJECTOR_ID;
      } else {
        return undefined;
      }
    },

    loadInclude(id) {
      logger.info(`Called "loadInclude": ${JSON.stringify({ id })}`);
      return id === RELEASE_INJECTOR_ID;
    },

    /**
     * Responsible for "virtually" loading the "sentry-release-injector" module. "Virtual" means that the module is not
     * read from somewhere on disk but rather just returned via a string.
     *
     * @param id Always the absolute (fully resolved) path to the module.
     * @returns The global injector code when we load the "sentry-release-injector" module. Otherwise returns `undefined`.
     */
    load(id) {
      sentryHub.addBreadcrumb({
        category: "load",
        level: "info",
      });

      if (id === RELEASE_INJECTOR_ID) {
        return generateGlobalInjectorCode({
          release: internalOptions.release,
          injectReleasesMap: internalOptions.injectReleasesMap,
          org: internalOptions.org,
          project: internalOptions.project,
        });
      } else {
        return undefined;
      }
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
      sentryHub.addBreadcrumb({
        category: "transformInclude",
        level: "info",
      });

      // We don't want to transform our injected code.
      if (id === RELEASE_INJECTOR_ID) {
        return false;
      }

      if (internalOptions.releaseInjectionTargets) {
        // If there's an `releaseInjectionTargets` option transform (ie. inject the release varible) when the file path matches the option.
        if (typeof internalOptions.releaseInjectionTargets === "function") {
          return internalOptions.releaseInjectionTargets(id);
        }

        return internalOptions.releaseInjectionTargets.some((entry) => {
          if (entry instanceof RegExp) {
            return entry.test(id);
          } else {
            return id === entry;
          }
        });
      } else {
        const pathIsOrdinary = !id.includes("?") && !id.includes("#");

        const pathHasAllowedFileEnding = ALLOWED_TRANSFORMATION_FILE_ENDINGS.some(
          (allowedFileEnding) => id.endsWith(allowedFileEnding)
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
    transform(code) {
      sentryHub.addBreadcrumb({
        category: "transform",
        level: "info",
      });

      // The MagicString library allows us to generate sourcemaps for the changes we make to the user code.
      const ms = new MagicString(code);

      // Appending instead of prepending has less probability of mucking with user's source maps.
      // Luckily import statements get hoisted to the top anyways.
      ms.append(`;\nimport "${RELEASE_INJECTOR_ID}";`);

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
    writeBundle() {
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

      createNewRelease(internalOptions, ctx)
        .then(() => cleanArtifacts(internalOptions, ctx))
        .then(() => uploadSourceMaps(internalOptions, ctx))
        .then(() => setCommits(internalOptions, ctx))
        .then(() => finalizeRelease(internalOptions, ctx))
        .then(() => addDeploy(internalOptions, ctx))
        .then(() => transaction?.setStatus("ok"))
        .catch((e: Error) => {
          transaction?.setStatus("cancelled");
          handleError(e, logger, internalOptions.errorHandler, sentryHub);
        })
        .finally(() => {
          sentryHub.addBreadcrumb({
            category: "writeBundle:finish",
            level: "info",
          });
          releasePipelineSpan?.finish();
          transaction?.finish();
        });
    },
  };
});

function handleError(
  error: Error,
  logger: Logger,
  errorHandler: InternalOptions["errorHandler"],
  sentryHub?: Hub
) {
  logger.error(error.message);

  if (sentryHub) {
    captureMinimalError(error, sentryHub);
  }

  if (errorHandler) {
    errorHandler(error);
  } else {
    throw error;
  }
}

/**
 * Generates code for the "sentry-release-injector" which is responsible for setting the global `SENTRY_RELEASE`
 * variable.
 */
function generateGlobalInjectorCode({
  release,
  injectReleasesMap,
  org,
  project,
}: {
  release: string;
  injectReleasesMap: boolean;
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
      _global.SENTRY_RELEASES["${key}"]={id:"${release}"};
      `;
  }

  return code;
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
