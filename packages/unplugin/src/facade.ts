/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
//TODO: remove eslint rules

// Build a facade that exposes necessary sentry functionality
// Idea: We start out with Sentry-CLI and replace the cli-commands one by one afterwards.
// Goal: eventually replace everything sentry-cli does with "native" code here
// Reason: We don't want to depend on a binary that gets downloaded in a postinstall hook
//           - no fixed version
//           - huge download
//           - unnecessary functionality

import { makeSentryCli } from "./cli";
import { Options } from "./types";

export type SentryFacade = {
  createNewRelease: () => any;
  cleanArtifacts: () => any;
  uploadSourceMaps: () => any;
  setCommits: () => any;
  finalizeRelease: () => any;
  addDeploy: () => any;
};

/**
 * Factory function that provides all necessary Sentry functionality for creating
 * a release on Sentry. This includes uploading source maps and finalizing the release
 */
export function makeSentryFacade(version: string, options: Options): SentryFacade {
  makeSentryCli(options);
  //TODO: remove
  // void cli.execute(["--version"], true);

  return {
    createNewRelease: () => createNewRelease(version),
    cleanArtifacts: () => cleanArtifacts(),
    uploadSourceMaps: () => uploadSourceMaps(version),
    setCommits: () => setCommits(version),
    finalizeRelease: () => finalizeRelease(version),
    addDeploy: () => addDeploy(version),
  };
}

function createNewRelease(version: string) {
  //TODO(must have): implement release creation logic here
}

function uploadSourceMaps(version: string) {
  //TODO(must have): implement source maps upload logic here
}

function finalizeRelease(version: string) {
  //TODO(must have): implement release finalization logic here
}

// TODO: Stuff we worry about later:

function cleanArtifacts() {
  // NOOP for now
}

function setCommits(version: string) {
  // NOOP for now
}

function addDeploy(version: string) {
  // NOOP for now
}
