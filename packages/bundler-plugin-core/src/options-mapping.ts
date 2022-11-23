import { Logger } from "./sentry/logger";
import { IncludeEntry as UserIncludeEntry, Options as UserOptions } from "./types";
import { arrayify } from "./utils";

type RequiredInternalOptions = Required<
  Pick<
    UserOptions,
    | "finalize"
    | "dryRun"
    | "debug"
    | "silent"
    | "cleanArtifacts"
    | "telemetry"
    | "injectReleasesMap"
  >
>;

type OptionalInternalOptions = Partial<
  Pick<
    UserOptions,
    | "org"
    | "project"
    | "authToken"
    | "url"
    | "vcsRemote"
    | "dist"
    | "errorHandler"
    | "setCommits"
    | "deploy"
    | "configFile"
    | "customHeader"
  >
>;

type NormalizedInternalOptions = {
  releaseInjectionTargets: (string | RegExp)[] | ((filePath: string) => boolean) | undefined;
  include: InternalIncludeEntry[];
};

export type InternalOptions = RequiredInternalOptions &
  OptionalInternalOptions &
  NormalizedInternalOptions;

type RequiredInternalIncludeEntry = Required<
  Pick<
    UserIncludeEntry,
    "paths" | "ext" | "stripCommonPrefix" | "sourceMapReference" | "rewrite" | "validate"
  >
>;

type OptionalInternalIncludeEntry = Partial<
  Pick<UserIncludeEntry, "ignoreFile" | "urlPrefix" | "urlSuffix" | "stripPrefix">
>;

export type InternalIncludeEntry = RequiredInternalIncludeEntry &
  OptionalInternalIncludeEntry & {
    ignore: string[];
  };

export const SENTRY_SAAS_URL = "https://sentry.io";

export function normalizeUserOptions(userOptions: UserOptions): InternalOptions {
  const options = {
    // include is the only strictly required option
    // (normalizeInclude needs all userOptions to access top-level include options)
    include: normalizeInclude(userOptions),

    // These options must be set b/c we need them for release injection.
    // They can also be set as environment variables. Technically, they
    // could be set in the config file but this would be too late for
    // release injection because we only pass the config file path
    // to the CLI
    org: userOptions.org ?? process.env["SENTRY_ORG"],
    project: userOptions.project ?? process.env["SENTRY_PROJECT"],
    // Falling back to the empty string here b/c at a later point, we use
    // Sentry CLI to determine a release if none was specified via options
    // or env vars. In case we don't find one, we'll bail at that point.
    release: userOptions.release ?? process.env["SENTRY_RELEASE"] ?? "",
    // We technically don't need the URL for anything release-specific
    // but we want to make sure that we're only sending Sentry data
    // of SaaS customers. Hence we want to read it anyway.
    url: userOptions.url ?? process.env["SENTRY_URL"] ?? SENTRY_SAAS_URL,

    // Options with default values
    finalize: userOptions.finalize ?? true,
    cleanArtifacts: userOptions.cleanArtifacts ?? false,
    dryRun: userOptions.dryRun ?? false,
    debug: userOptions.debug ?? false,
    silent: userOptions.silent ?? false,
    telemetry: userOptions.telemetry ?? true,
    injectReleasesMap: userOptions.injectReleasesMap ?? false,

    // These options and can also be set via env variables or the config file.
    // If they're set in the options, we simply pass them to the CLI constructor.
    // Sentry CLI will internally query env variables and read its config file if
    // the passed options are undefined.
    authToken: userOptions.authToken, // env var: `SENTRY_AUTH_TOKEN`

    // CLI v1 (and the "old" webpack plugin) use `CUSTOM_HEADER`,
    // but CLI v2 uses `SENTRY_HEADER` (which is also better aligned with other naming)
    // In the spirit of maximum compatibility, we allow both here.
    customHeader:
      userOptions.customHeader ?? process.env["SENTRY_HEADER"] ?? process.env["CUSTOM_HEADER"],

    vcsRemote: userOptions.vcsRemote, // env var: `SENTRY_VSC_REMOTE`

    // Optional options
    setCommits: userOptions.setCommits,
    deploy: userOptions.deploy,
    releaseInjectionTargets: normalizeReleaseInjectionTargets(userOptions.releaseInjectionTargets),
    dist: userOptions.dist,
    errorHandler: userOptions.errorHandler,
    configFile: userOptions.configFile,
  };

  return options;
}

/**
 * Converts the user-facing `releaseInjectionTargets` option to the internal
 * `releaseInjectionTargets` option
 */
function normalizeReleaseInjectionTargets(
  userReleaseInjectionTargets: UserOptions["releaseInjectionTargets"]
): (string | RegExp)[] | ((filePath: string) => boolean) | undefined {
  if (userReleaseInjectionTargets === undefined) {
    return undefined;
  } else if (typeof userReleaseInjectionTargets === "function") {
    return userReleaseInjectionTargets;
  } else {
    return arrayify(userReleaseInjectionTargets);
  }
}

/**
 * Converts the user-facing `include` option to the internal `include` option,
 * resulting in an array of `InternalIncludeEntry` objects. This later on lets us
 * work with only one type of include data structure instead of multiple.
 *
 * During the process, we hoist top-level include options (e.g. urlPrefix) into each
 * object if they were not alrady specified in an `IncludeEntry`, making every object
 * fully self-contained. This is also the reason why we pass the entire options
 * object and not just `include`.
 *
 * @param userOptions the entire user-facing `options` object
 *
 * @return an array of `InternalIncludeEntry` objects.
 */
function normalizeInclude(userOptions: UserOptions): InternalIncludeEntry[] {
  return arrayify(userOptions.include)
    .map((includeItem) =>
      typeof includeItem === "string" ? { paths: [includeItem] } : includeItem
    )
    .map((userIncludeEntry) => normalizeIncludeEntry(userOptions, userIncludeEntry));
}

/**
 * Besides array-ifying the `ignore` option, this function hoists top level options into the items of the `include`
 * option. This is to simplify the handling of of the `include` items later on.
 */
function normalizeIncludeEntry(
  userOptions: UserOptions,
  includeEntry: UserIncludeEntry
): InternalIncludeEntry {
  const ignoreOption = includeEntry.ignore ?? userOptions.ignore ?? ["node_modules"];
  const ignore = Array.isArray(ignoreOption) ? ignoreOption : [ignoreOption];

  // We're prefixing all entries in the `ext` option with a `.` (if it isn't already) to align with Node.js' `path.extname()`
  const ext = includeEntry.ext ?? userOptions.ext ?? ["js", "map", "jsbundle", "bundle"];
  const dotPrefixedExt = ext.map((extension) => `.${extension.replace(/^\./, "")}`);

  return {
    paths: includeEntry.paths,
    ignore,
    ignoreFile: includeEntry.ignoreFile ?? userOptions.ignoreFile,
    ext: dotPrefixedExt,
    urlPrefix: includeEntry.urlPrefix ?? userOptions.urlPrefix,
    urlSuffix: includeEntry.urlSuffix ?? userOptions.urlSuffix,
    stripPrefix: includeEntry.stripPrefix ?? userOptions.stripPrefix,
    stripCommonPrefix: includeEntry.stripCommonPrefix ?? userOptions.stripCommonPrefix ?? false,
    sourceMapReference: includeEntry.sourceMapReference ?? userOptions.sourceMapReference ?? true,
    rewrite: includeEntry.rewrite ?? userOptions.rewrite ?? true,
    validate: includeEntry.validate ?? userOptions.validate ?? false,
  };
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
export function validateOptions(options: InternalOptions, logger: Logger): boolean {
  if (options.injectReleasesMap && !options.org) {
    logger.error(
      "The `injectReleasesMap` option was set but it is only supported when the `org` option is also specified.",
      "Please set the `org` option (you can also set the SENTRY_ORG environment variable) or disable the `injectReleasesMap` option."
    );
    return false;
  }

  const setCommits = options.setCommits;
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

  if (options.deploy && !options.deploy.env) {
    logger.error(
      "The `deploy` option was specified but is missing the required `env` property.",
      "Please set the `env` property."
    );
    return false;
  }

  return true;
}
