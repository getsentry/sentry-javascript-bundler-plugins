import { Logger } from "./sentry/logger";
import { Options as UserOptions } from "./types";
import { determineReleaseName } from "./utils";

export type NormalizedOptions = ReturnType<typeof normalizeUserOptions>;

export const SENTRY_SAAS_URL = "https://sentry.io";

export function normalizeUserOptions(userOptions: UserOptions) {
  const options = {
    org: userOptions.org ?? process.env["SENTRY_ORG"],
    project: userOptions.project ?? process.env["SENTRY_PROJECT"],
    authToken: userOptions.authToken ?? process.env["SENTRY_AUTH_TOKEN"],
    url: userOptions.url ?? process.env["SENTRY_URL"] ?? SENTRY_SAAS_URL,
    headers: userOptions.headers,
    debug: userOptions.debug ?? false,
    silent: userOptions.silent ?? false,
    errorHandler: userOptions.errorHandler,
    telemetry: userOptions.telemetry ?? true,
    disable: userOptions.disable ?? false,
    sourcemaps: userOptions.sourcemaps,
    release: {
      ...userOptions.release,
      name: userOptions.release?.name ?? process.env["SENTRY_RELEASE"] ?? determineReleaseName(),
      inject: userOptions.release?.inject ?? true,
      create: userOptions.release?.create ?? true,
      finalize: userOptions.release?.finalize ?? true,
      vcsRemote: userOptions.release?.vcsRemote ?? process.env["SENTRY_VSC_REMOTE"] ?? "origin",
    },
    bundleSizeOptimizations: userOptions.bundleSizeOptimizations,
    reactComponentAnnotation: userOptions.reactComponentAnnotation,
    _metaOptions: {
      telemetry: {
        metaFramework: userOptions._metaOptions?.telemetry?.metaFramework,
      },
    },
    applicationKey: userOptions.applicationKey,
    moduleMetadata: userOptions.moduleMetadata,
    _experiments: userOptions._experiments ?? {},
  };

  return options;
}

/**
 * Validates a few combinations of options that are not checked by Sentry CLI.
 *
 * For all other options, we can rely on Sentry CLI to validate them. In fact,
 * we can't validate them in the plugin because Sentry CLI might pick up options from
 * its config file.
 *
 * @param options the internal options
 * @param logger the logger
 *
 * @returns `true` if the options are valid, `false` otherwise
 */
export function validateOptions(options: NormalizedOptions, logger: Logger): boolean {
  const setCommits = options.release?.setCommits;
  if (setCommits) {
    if (!setCommits.auto && !(setCommits.repo && setCommits.commit)) {
      logger.error(
        "The `setCommits` option was specified but is missing required properties.",
        "Please set either `auto` or both, `repo` and `commit`."
      );
      return false;
    }
    if (setCommits.auto && setCommits.repo && setCommits) {
      logger.warn(
        "The `setCommits` options includes `auto` but also `repo` and `commit`.",
        "Ignoring `repo` and `commit`.",
        "Please only set either `auto` or both, `repo` and `commit`."
      );
    }
  }

  if (options.release?.deploy && !options.release?.deploy.env) {
    logger.error(
      "The `deploy` option was specified but is missing the required `env` property.",
      "Please set the `env` property."
    );
    return false;
  }

  return true;
}
