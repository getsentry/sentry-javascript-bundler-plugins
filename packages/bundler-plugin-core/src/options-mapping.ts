import { detectRelease } from "./detect-release";
import { IncludeEntry as UserIncludeEntry, Options as UserOptions } from "./types";

type RequiredInternalOptions = Required<
  Pick<
    UserOptions,
    | "org"
    | "project"
    | "authToken"
    | "url"
    | "release"
    | "finalize"
    | "validate"
    | "vcsRemote"
    | "customHeaders"
    | "dryRun"
    | "debug"
    | "silent"
    | "cleanArtifacts"
    | "telemetry"
  >
>;

type OptionalInternalOptions = Partial<
  Pick<UserOptions, "dist" | "errorHandler" | "setCommits" | "deploy">
>;

type NormalizedInternalOptions = {
  entries: (string | RegExp)[] | ((filePath: string) => boolean) | undefined;
  include: InternalIncludeEntry[];
};

export type InternalOptions = RequiredInternalOptions &
  OptionalInternalOptions &
  NormalizedInternalOptions;

type RequiredInternalIncludeEntry = Required<
  Pick<UserIncludeEntry, "paths" | "ext" | "stripCommonPrefix" | "sourceMapReference" | "rewrite">
>;

type OptionalInternalIncludeEntry = Partial<
  Pick<UserIncludeEntry, "ignoreFile" | "urlPrefix" | "urlSuffix" | "stripPrefix">
>;

type InternalIncludeEntry = RequiredInternalIncludeEntry &
  OptionalInternalIncludeEntry & {
    ignore: string[];
  };

export function normalizeUserOptions(userOptions: UserOptions): InternalOptions {
  let entries: (string | RegExp)[] | ((filePath: string) => boolean) | undefined;
  if (userOptions.entries === undefined) {
    entries = undefined;
  } else if (typeof userOptions.entries === "function" || Array.isArray(userOptions.entries)) {
    entries = userOptions.entries;
  } else {
    entries = [userOptions.entries];
  }

  let userInclude: UserIncludeEntry[];
  if (typeof userOptions.include === "string") {
    userInclude = [convertIncludePathToIncludeEntry(userOptions.include)];
  } else if (Array.isArray(userOptions.include)) {
    userInclude = userOptions.include.map((potentialIncludeEntry) => {
      if (typeof potentialIncludeEntry === "string") {
        return convertIncludePathToIncludeEntry(potentialIncludeEntry);
      } else {
        return potentialIncludeEntry;
      }
    });
  } else {
    userInclude = [userOptions.include];
  }

  const include = userInclude.map((userIncludeEntry) =>
    normalizeIncludeEntry(userOptions, userIncludeEntry)
  );

  return {
    org: userOptions.org,
    project: userOptions.project,
    authToken: userOptions.authToken,
    url: userOptions.url ?? "https://sentry.io/",
    release: userOptions.release ?? detectRelease(),
    finalize: userOptions.finalize ?? true,
    validate: userOptions.validate ?? false,
    vcsRemote: userOptions.vcsRemote ?? "origin",
    customHeaders: userOptions.customHeaders ?? {},
    dryRun: userOptions.dryRun ?? false,
    debug: userOptions.debug ?? false,
    silent: userOptions.silent ?? false,
    cleanArtifacts: userOptions.cleanArtifacts ?? false,
    telemetry: userOptions.telemetry ?? true,
    dist: userOptions.dist,
    errorHandler: userOptions.errorHandler,
    setCommits: userOptions.setCommits,
    deploy: userOptions.deploy,
    entries,
    include,
  };
}

function convertIncludePathToIncludeEntry(includePath: string): UserIncludeEntry {
  return {
    paths: [includePath],
  };
}

/**
 * Besides array-ifying the `ignore` option, this function hoists top level options into the items of the `include`
 * option. This is to simplify the handling of of the `include` items later on.
 */
function normalizeIncludeEntry(
  userOptions: UserOptions,
  includeEntry: UserIncludeEntry
): InternalIncludeEntry {
  const ignoreOption = includeEntry.ignore ?? userOptions.ignore ?? [];
  const ignore = Array.isArray(ignoreOption) ? ignoreOption : [ignoreOption];

  return {
    paths: includeEntry.paths,
    ignore,
    ignoreFile: includeEntry.ignoreFile ?? userOptions.ignoreFile,
    ext: includeEntry.ext ?? userOptions.ext ?? ["js", "map", "jsbundle", "bundle"],
    urlPrefix: includeEntry.urlPrefix ?? userOptions.urlPrefix,
    urlSuffix: includeEntry.urlSuffix ?? userOptions.urlSuffix,
    stripPrefix: includeEntry.stripPrefix ?? userOptions.stripPrefix,
    stripCommonPrefix: includeEntry.stripCommonPrefix ?? userOptions.stripCommonPrefix ?? false,
    sourceMapReference: includeEntry.sourceMapReference ?? userOptions.sourceMapReference ?? true,
    rewrite: includeEntry.rewrite ?? userOptions.rewrite ?? true,
  };
}
