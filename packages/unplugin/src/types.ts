//TODO: JsDoc for all properties

import { Hub } from "@sentry/hub";
import { Span } from "@sentry/tracing";
import sentryLogger from "./sentry/logger";

//TODO: compare types w/ webpack plugin (and sentry-cli?)
export type Options = {
  /* --- authentication/identification: */
  org?: string;
  project?: string;
  authToken?: string;
  url?: string;

  /* --- release properties: */
  release?: string;
  // dist: string,

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

  finalize?: boolean;

  /* --- source maps properties: */
  include: string; // | Array<string | IncludeEntry>;
  // ignoreFile: string
  // ignore: string | string[]
  ext?: string[];
  // urlPrefix: string,
  // urlSuffix: string,
  // validate: boolean
  // stripPrefix?: boolean,
  // stripCommonPrefix?: boolean,
  // sourceMapReference?: boolean,
  // rewrite?: boolean,

  /* --- other unimportant (for now) stuff- properties: */
  // vcsRemote: string,
  // customHeader: string,

  // dryRun?: boolean,
  debug?: boolean;
  silent?: boolean;
  cleanArtifacts?: boolean;

  /**
   * When an error occurs during rlease creation or sourcemaps upload, the plugin will call this function.
   *
   * By default, the plugin will simply throw an error, thereby stopping the bundling process. If an `errorHandler` callback is provided, compilation will continue, unless an error is thrown in the provided callback.
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
  // setCommits?: {
  //   repo?: string,
  //   commit?: string,
  //   previousCommit?: string,
  //   auto?: boolean,
  //   ignoreMissing?: boolean
  // },
  // deploy?: {
  //   env: string,
  //   started?: number,
  //   finished?: number,
  //   time?: number,
  //   name?: string,
  //   url?: string,
  // }

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
};

/*
type IncludeEntry = {
  paths: string[];
  //TODO: what about the other entries??
};
*/

/**
 * Holds data for internal purposes
 * (e.g. telemetry and logging)
 */
export type BuildContext = {
  hub: Hub;
  parentSpan?: Span;
  logger: ReturnType<typeof sentryLogger>;
};
