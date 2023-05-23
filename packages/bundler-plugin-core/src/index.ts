import SentryCli from "@sentry/cli";
import fs from "fs";
import { createUnplugin, UnpluginOptions } from "unplugin";
import { normalizeUserOptions, validateOptions } from "./options-mapping";
import { debugIdUploadPlugin } from "./plugins/debug-id-upload";
import { releaseManagementPlugin } from "./plugins/release-management";
import { telemetryPlugin } from "./plugins/telemetry";
import { createLogger } from "./sentry/logger";
import { allowedToSendTelemetry, createSentryInstance } from "./sentry/telemetry";
import { Options } from "./types";
import {
  determineReleaseName,
  generateGlobalInjectorCode,
  getDependencies,
  getPackageJson,
  parseMajorVersion,
} from "./utils";

import { v4 as uuidV4 } from "uuid";

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
    const pluginExecutionTransaction = sentryHub.startTransaction({
      name: "Sentry Bundler Plugin execution",
    });
    sentryHub.getScope().setSpan(pluginExecutionTransaction);

    const logger = createLogger({
      prefix: `[sentry-${unpluginMetaContext.framework}-plugin]`,
      silent: options.silent,
      debug: options.debug,
    });

    function handleRecoverableError(unknownError: unknown) {
      pluginExecutionTransaction.setStatus("internal_error");

      if (options.errorHandler) {
        if (unknownError instanceof Error) {
          options.errorHandler(unknownError);
        } else {
          options.errorHandler(new Error("An unknown error occured"));
        }
      } else {
        throw unknownError;
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
        pluginExecutionTransaction,
        logger,
        shouldSendTelemetry,
        sentryClient,
      })
    );

    if (!options.release.inject) {
      logger.debug(
        "Release injection disabled via `release.inject` option. Will not inject release."
      );
    } else if (!options.release.name) {
      logger.warn(
        "No release name provided. Will not inject release. Please set the `release.name` option to identifiy your release."
      );
    } else {
      const injectionCode = generateGlobalInjectorCode({
        release: options.release.name,
        injectBuildInformation: options._experiments.injectBuildInformation || false,
      });
      plugins.push(releaseInjectionPlugin(injectionCode));
    }

    const releaseManagementPluginReleaseName = options.release.name ?? determineReleaseName();
    if (!releaseManagementPluginReleaseName) {
      logger.warn(
        "No release name provided. Will not create release. Please set the `release.name` option to identifiy your release."
      );
    } else if (!options.authToken) {
      logger.warn(
        "No auth token provided. Will not create release. Please set the `authToken` option. You can find information on how to generate a Sentry auth token here: https://docs.sentry.io/api/auth/"
      );
    } else if (!options.org) {
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
          releaseName: releaseManagementPluginReleaseName,
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

    if (options.sourcemaps) {
      if (!options.authToken) {
        logger.warn(
          "No auth token provided. Will not upload source maps. Please set the `authToken` option. You can find information on how to generate a Sentry auth token here: https://docs.sentry.io/api/auth/"
        );
      } else if (!options.org) {
        logger.warn(
          "No org provided. Will not upload source maps. Please set the `org` option to your Sentry organization slug."
        );
      } else if (!options.project) {
        logger.warn(
          "No project provided. Will not upload source maps. Please set the `project` option to your Sentry project slug."
        );
      } else if (!options.sourcemaps.assets) {
        logger.warn(
          "No assets defined. Will not upload source maps. Please provide set the `assets` option to your build-output folder."
        );
      } else {
        plugins.push(debugIdInjectionPlugin());
        plugins.push(
          debugIdUploadPlugin({
            assets: options.sourcemaps.assets,
            ignore: options.sourcemaps.ignore,
            deleteFilesAfterUpload: options.sourcemaps.deleteFilesAfterUpload,
            dist: options.release.dist,
            releaseName: options.release.name,
            logger: logger,
            handleRecoverableError: handleRecoverableError,
            rewriteSourcesHook: options.sourcemaps.rewriteSources,
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
  return {
    banner: injectionCode,
  };
}

export function createRollupDebugIdInjectionHooks() {
  return {
    banner: () => {
      return getDebugIdSnippet(uuidV4());
    },
  };
}

export function getDebugIdSnippet(debugId: string): string {
  return `;!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="${debugId}",e._sentryDebugIdIdentifier="sentry-dbid-${debugId}")}catch(e){}}();`;
}

export type { Options } from "./types";
