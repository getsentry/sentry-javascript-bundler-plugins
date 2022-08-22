/* eslint-disable no-console */
//TODO: remove eslint rule

// Build a facade that exposes necessary sentry functionality
// Idea: We start out with Sentry-CLI and replace the cli-commands one by one afterwards.
// Goal: eventually replace everything sentry-cli does with "native" code here
// Reason: We don't want to depend on a binary that gets downloaded in a postinstall hook
//           - no fixed version
//           - huge download
//           - unnecessary functionality

import SentryCli from "@sentry/cli";
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
  console.log("makeSentryFacade", version, options);

  const cli = makeSentryCli(options);
  console.log(cli);
  console.log(SentryCli.getVersion());

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
  console.log("new release", version);
}

function uploadSourceMaps(version: string) {
  //TODO(must have): implement source maps upload logic here
  console.log("new release", version);
}

function finalizeRelease(version: string) {
  //TODO(must have): implement release finalization logic here
  console.log("new release", version);
}

// TODO: Stuff we worry about later:

function cleanArtifacts() {
  console.log("I'm a no-op for now, lol");
}

function setCommits(version: string) {
  console.log("I'm a no-op for now, lol", version);
}

function addDeploy(version: string) {
  console.log("I'm a no-op for now, lol", version);
}
