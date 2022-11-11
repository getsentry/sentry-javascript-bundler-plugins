import { Hub } from "@sentry/hub";
import { Span } from "@sentry/tracing";
import { SentryCLILike } from "./sentry/cli";
import { createLogger } from "./sentry/logger";

/**
 * The main options object holding all plugin options available to users
 */
export type Options = Omit<IncludeEntry, "paths"> & {
  /* --- authentication/identification: */

  /**
   * The slug of the Sentry organization associated with the app.
   *
   * This value can also be set via the `SENTRY_ORG` env variable.
   */
  org?: string;

  /**
   * The slug of the Sentry project associated with the app.
   *
   * This value can also be set via the `SENTRY_PROJECT` env variable.
   */
  project?: string;

  /**
   * The authentication token to use for all communication with Sentry.
   * Can be obtained from https://sentry.io/settings/account/api/auth-tokens/.
   * Required scopes: project:releases (and org:read if setCommits option is used).
   *
   * This value can also be set via the `SENTRY_AUTH_TOKEN` env variable
   */
  authToken?: string;

  /**
   * The base URL of your Sentry instance. Use this if you are using a self-hosted
   * or Sentry instance other than sentry.io.
   *
   * This value can also be set via the `SENTRY_URL` env variable.
   *
   * Defaults to https://sentry.io/, which is the correct value for SAAS customers.
   */
  url?: string;

  /* --- release properties: */

  /**
   * Unique identifier for the release.
   *
   * This value can also be set via the `SENTRY_RELEASE` env variable.
   *
   * Defaults to the output of the sentry-cli releases propose-version command,
   * which automatically detects values for Cordova, Heroku, AWS CodeBuild, CircleCI,
   * Xcode, and Gradle, and otherwise uses HEAD's commit SHA. (For HEAD option,
   * requires access to git CLI and for the root directory to be a valid repository).
   */
  release?: string;

  /**
   * Unique identifier for the distribution, used to further segment your release.
   * Usually your build number.
   */
  dist?: string;

  /**
   * Filter for bundle entry points that should contain the provided release. By default, the release will be injected
   * into all entry points.
   *
   * This option takes a string, a regular expression, or an array containing strings, regular expressions, or both.
   * It's also possible to provide a filter function that takes the absolute path of a processed entrypoint and should
   * return `true` if the release should be injected into the entrypoint and `false` otherwise. String values of this
   * option require a full match with the absolute path of the bundle.
   */
  entries?: (string | RegExp)[] | RegExp | string | ((filePath: string) => boolean);

  /**
   * Determines if the Sentry release record should be automatically finalized
   * (meaning a date_released timestamp is added) after artifact upload.
   *
   * Defaults to `true`.
   */
  finalize?: boolean;

  /* --- source maps properties: */

  /**
   * One or more paths that Sentry CLI should scan recursively for sources.
   * It will upload all .map files and match associated .js files.
   * Each path can be given as a string or an object with path-specific options
   *
   * This is a required field.
   */
  include: string | IncludeEntry | Array<string | IncludeEntry>;

  /* --- other unimportant (for now) stuff- properties: */

  /**
   * Version control system remote name.
   *
   * This value can also be set via the `SENTRY_VSC_REMOTE` env variable.
   *
   * Defaults to 'origin'.
   */
  vcsRemote?: string;

  /**
   * A header added to every outgoing network request.
   * The format should be `header-key: header-value`.
   *
   * This value can also be set via the `CUSTOM_HEADER` env variable.
   */
  customHeader?: string;

  /**
   * Attempts a dry run (useful for dev environments).
   *
   * Defaults to `false`, but may be automatically set to `true` in development environments
   * by some framework integrations (Next.JS, possibly others).
   */
  dryRun?: boolean;

  /**
   * Print useful debug information.
   *
   * Defaults to `false`.
   */
  debug?: boolean;

  /**
   * Suppresses all logs.
   *
   * Defaults to `false`.
   */
  silent?: boolean;

  /**
   * Remove all the artifacts in the release before the upload.
   *
   * Defaults to `false`.
   */
  cleanArtifacts?: boolean;

  /**
   * When an error occurs during rlease creation or sourcemaps upload, the plugin will call this function.
   *
   * By default, the plugin will simply throw an error, thereby stopping the bundling process.
   * If an `errorHandler` callback is provided, compilation will continue, unless an error is
   * thrown in the provided callback.
   *
   * To allow compilation to continue but still emit a warning, set this option to the following:
   *
   * ```js
   * (err) => {
   *   console.warn(err);
   * }
   * ```
   */
  errorHandler?: (err: Error) => void;

  /**
   * Adds commits to Sentry.
   */
  setCommits?: SetCommitsOptions;

  /**
   * Creates a new release deployment in Sentry.
   */
  deploy?: DeployOptions;

  /**
   * If set to true, internal plugin errors and performance data will be sent to Sentry.
   *
   * At Sentry we like to use Sentry ourselves to deliver faster and more stable products.
   * We're very careful of what we're sending. We won't collect anything other than error
   * and high-level performance data. We will never collect your code or any details of the
   * projects in which you're using this plugin.
   *
   * Defaults to true
   */
  telemetry?: boolean;

  /**
   * Path to Sentry CLI config properties, as described in
   * https://docs.sentry.io/product/cli/configuration/#configuration-file.
   *
   * By default, the config file is looked for upwards from the current path, and
   * defaults from ~/.sentryclirc are always loaded
   */
  configFile?: string;

  /**
   * If set to true, the plugin will inject an additional `SENTRY_RELEASES` variable that
   * maps from `{org}@{project}` to the `release` value. This might be helpful for webpack
   * module federation or micro frontend setups.
   *
   * Defaults to `false`
   */
  injectReleasesMap?: boolean;
};

export type IncludeEntry = {
  /**
   * One or more paths to scan for files to upload.
   */
  paths: string[];

  /**
   * One or more paths to ignore during upload.
   * Overrides entries in ignoreFile file.
   *
   * Defaults to `['node_modules']` if neither `ignoreFile` nor `ignore` is set.
   */
  ignore?: string | string[];

  /**
   * Path to a file containing list of files/directories to ignore.
   *
   * Can point to `.gitignore` or anything with the same format.
   */
  ignoreFile?: string;

  /**
   * Array of file extensions of files to be collected for the file upload.
   *
   * By default the following file extensions are processed: js, map, jsbundle and bundle.
   */
  ext?: string[];

  /**
   * URL prefix to add to the beginning of all filenames.
   * Defaults to '~/' but you might want to set this to the full URL.
   *
   * This is also useful if your files are stored in a sub folder. eg: url-prefix '~/static/js'.
   */
  urlPrefix?: string;

  /**
   * URL suffix to add to the end of all filenames.
   * Useful for appending query parameters.
   */
  urlSuffix?: string;

  /**
   * When paired with the `rewrite`, this will remove a prefix from filename references inside of
   * sourcemaps. For instance you can use this to remove a path that is build machine specific.
   * Note that this will NOT change the names of uploaded files.
   */
  stripPrefix?: string[];

  /**
   * When paired with rewrite, this will add `~` to the stripPrefix array.
   *
   * Defaults to false.
   */
  stripCommonPrefix?: boolean;

  /**
   * Determines whether sentry-cli should attempt to link minified files with their corresponding maps.
   * By default, it will match files and maps based on name, and add a Sourcemap header to each minified file
   * for which it finds a map. Can be disabled if all minified files contain sourceMappingURL.
   *
   * Defaults to true.
   */
  sourceMapReference?: boolean;

  /**
   * Enables rewriting of matching source maps so that indexed maps are flattened and missing sources
   * are inlined if possible.
   *
   * Defaults to true
   */
  rewrite?: boolean;

  /**
   * When `true`, attempts source map validation before upload if rewriting is not enabled.
   * It will spot a variety of issues with source maps and cancel the upload if any are found.
   *
   * Defaults to `false` as this can cause false positives.
   */
  validate?: boolean;
};

type SetCommitsOptions = (AutoSetCommitsOptions | ManualSetCommitsOptions) & {
  /**
   * The commit before the beginning of this release (in other words,
   * the last commit of the previous release).
   *
   * Defaults to the last commit of the previous release in Sentry.
   *
   * If there was no previous release, the last 10 commits will be used.
   */
  previousCommit?: string;

  /**
   * If the flag is to `true` and the previous release commit was not found
   * in the repository, we create a release with the default commits count
   * instead of failing the command.
   *
   * Defaults to `false`.
   */
  ignoreMissing?: boolean;

  /**
   * If this flag is set, the setCommits step will not fail and just exit
   * silently if no new commits for a given release have been found.
   *
   * Defaults to `false`.
   */
  ignoreEmpty?: boolean;
};

type AutoSetCommitsOptions = {
  /**
   * Automatically sets `commit` and `previousCommit`. Sets `commit` to `HEAD`
   * and `previousCommit` as described in the option's documentation.
   *
   * If you set this to `true`, manually specified `commit` and `previousCommit`
   * options will be overridden. It is best to not specify them at all if you
   * set this option to `true`.
   */
  auto: true;

  repo?: undefined;
  commit?: undefined;
};

type ManualSetCommitsOptions = {
  auto?: false | undefined;

  /**
   * The full repo name as defined in Sentry.
   *
   * Required if `auto` option is not set to `true`.
   */
  repo: string;

  /**
   * The current (last) commit in the release.
   *
   * Required if `auto` option is not set to `true`.
   */
  commit: string;
};

type DeployOptions = {
  /**
   * Environment for this release. Values that make sense here would
   * be `production` or `staging`.
   */
  env: string;

  /**
   * Deployment start time in Unix timestamp (in seconds) or ISO 8601 format.
   */
  started?: number | string;

  /**
   * Deployment finish time in Unix timestamp (in seconds) or ISO 8601 format.
   */
  finished?: number | string;

  /**
   * Deployment duration (in seconds). Can be used instead of started and finished.
   */
  time?: number;

  /**
   * Human readable name for the deployment.
   */
  name?: string;

  /**
   * URL that points to the deployment.
   */
  url?: string;
};

/**
 * Holds data for internal purposes
 * (e.g. telemetry and logging)
 */
export type BuildContext = {
  hub: Hub;
  parentSpan?: Span;
  logger: ReturnType<typeof createLogger>;
  cli: SentryCLILike;
};
