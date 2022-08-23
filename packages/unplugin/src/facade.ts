// Build a facade that exposes necessary sentry functionality
// Idea: We start out with Sentry-CLI and replace the cli-commands one by one afterwards.
// Goal: eventually replace everything sentry-cli does with "native" code here
// Reason: We don't want to depend on a binary that gets downloaded in a postinstall hook
//           - no fixed version
//           - huge download
//           - unnecessary functionality

import { makeSentryCli } from "./cli";
import { Options } from "./types";
import SentryCli from "@sentry/cli";

export type SentryFacade = {
  createNewRelease: () => Promise<string>;
  cleanArtifacts: () => Promise<string>;
  uploadSourceMaps: () => Promise<string>;
  setCommits: () => Promise<string>;
  finalizeRelease: () => Promise<string>;
  addDeploy: () => Promise<string>;
};

/**
 * Factory function that provides all necessary Sentry functionality for creating
 * a release on Sentry. This includes uploading source maps and finalizing the release
 */
export function makeSentryFacade(release: string, options: Options): SentryFacade {
  const cli = makeSentryCli(options);

  return {
    createNewRelease: () => createNewRelease(cli, release),
    cleanArtifacts: () => cleanArtifacts(cli, release, options),
    uploadSourceMaps: () => uploadSourceMaps(cli, release, options),
    setCommits: () => setCommits(/* release */),
    finalizeRelease: () => finalizeRelease(cli, release, options),
    addDeploy: () => addDeploy(/* release */),
  };
}

async function createNewRelease(cli: SentryCli, release: string): Promise<string> {
  return cli.releases.new(release);
}

async function uploadSourceMaps(
  cli: SentryCli,
  release: string,
  options: Options
): Promise<string> {
  /**
   * One or more paths to ignore during upload. Overrides entries in ignoreFile file.
   */

  const {
    include,
    // ignore,
    // ignoreFile,
    // rewrite,
    // sourceMapReference,
    // stripPrefix,
    // stripCommonPrefix,
    // validate,
    // urlPrefix,
    // urlSuffix,
    // ext,
  } = options;

  //TODO: sort out mess between Sentry CLI options and WebPack plugin options (ideally,
  //      we normalize everything before and don't diverge with options between our
  //      own CLI implementation and the plugin.
  //      I don't want to do too much for this right now b/c we'll eventually get rid of the CLI anyway
  const uploadSourceMapsOptions = { include: typeof include === "string" ? [include] : include };

  return cli.releases.uploadSourceMaps(release, uploadSourceMapsOptions);
}

async function finalizeRelease(cli: SentryCli, release: string, options: Options): Promise<string> {
  if (options.finalize) {
    return cli.releases.finalize(release);
  }
  return Promise.resolve("nothing to do here");
}

async function cleanArtifacts(cli: SentryCli, release: string, options: Options): Promise<string> {
  if (options.cleanArtifacts) {
    return cli.releases.execute(["releases", "files", release, "delete", "--all"], true);
  }
  return Promise.resolve("nothing to do here");
}

// TODO: Stuff we worry about later:

async function setCommits(/* version: string */): Promise<string> {
  return Promise.resolve("Noop");
}

async function addDeploy(/* version: string */): Promise<string> {
  return Promise.resolve("Noop");
}
