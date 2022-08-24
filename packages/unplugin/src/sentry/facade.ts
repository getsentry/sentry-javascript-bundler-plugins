// Build a facade that exposes necessary sentry functionality
// Idea: We start out with Sentry-CLI and replace the cli-commands one by one afterwards.
// Goal: eventually replace everything sentry-cli does with "native" code here
// Reason: We don't want to depend on a binary that gets downloaded in a postinstall hook
//           - no fixed version
//           - huge download
//           - unnecessary functionality

import { Options } from "../types";
import { createRelease, deleteAllReleaseArtifacts, uploadReleaseFile, updateRelease } from "./api";
import { getFiles } from "./sourcemaps";

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
  return {
    createNewRelease: () => createNewRelease(release, options),
    cleanArtifacts: () => cleanArtifacts(release, options),
    uploadSourceMaps: () => uploadSourceMaps(release, options),
    setCommits: () => setCommits(/* release */),
    finalizeRelease: () => finalizeRelease(release, options),
    addDeploy: () => addDeploy(/* release */),
  };
}

async function createNewRelease(release: string, options: Options): Promise<string> {
  // TODO: pull these checks out of here and simplify them
  if (options.authToken === undefined) {
    // eslint-disable-next-line no-console
    console.log('[Sentry-plugin] WARNING: Missing "authToken" option. Will not create release.');
    return Promise.resolve("nothing to do here");
  } else if (options.org === undefined) {
    // eslint-disable-next-line no-console
    console.log('[Sentry-plugin] WARNING: Missing "org" option. Will not create release.');
    return Promise.resolve("nothing to do here");
  } else if (options.url === undefined) {
    // eslint-disable-next-line no-console
    console.log('[Sentry-plugin] WARNING: Missing "url" option. Will not create release.');
    return Promise.resolve("nothing to do here");
  } else if (options.project === undefined) {
    // eslint-disable-next-line no-console
    console.log('[Sentry-plugin] WARNING: Missing "project" option. Will not create release.');
    return Promise.resolve("nothing to do here");
  }

  await createRelease({
    release,
    authToken: options.authToken,
    org: options.org,
    project: options.project,
    sentryUrl: options.url,
  });

  // eslint-disable-next-line no-console
  console.log("[Sentry-plugin] Successfully created release.");

  return Promise.resolve("nothing to do here");
}

async function uploadSourceMaps(release: string, options: Options): Promise<string> {
  // This is what Sentry CLI does:
  //  TODO: 0. Preprocess source maps
  //           - (Out of scope for now)
  //           - For rewriting source maps see https://github.com/getsentry/rust-sourcemap/blob/master/src/types.rs#L763
  //  TODO: 1. Creates a new release to make sure it exists
  //           - can we assume that the release will exist b/c we don't give unplugin users the
  //           option to skip this step?
  //  TODO: 2. download already uploaded files and get their checksums
  //  TODO: 3. identify new or changed files (by comparing checksums)
  //  TODO: 4. upload new and changed files
  //           - CLI asks API for chunk options https://github.com/getsentry/sentry-cli/blob/7b8466885d9cfd51aee6fdc041eca9f645026303/src/utils/file_upload.rs#L106-L112
  //           - WTF?
  //           - don't upload more than 20k files
  //           - upload files concurrently
  //           - 2 options: chunked upload (multiple files per chunk) or single file upload

  const {
    include,
    ext,
    // ignore,
    // ignoreFile,
    // rewrite,
    // sourceMapReference,
    // stripPrefix,
    // stripCommonPrefix,
    // validate,
    // urlPrefix,
    // urlSuffix,
    org,
    project,
    authToken,
    url,
  } = options;

  // TODO: pull these checks out of here and simplify them
  if (authToken === undefined) {
    // eslint-disable-next-line no-console
    console.log('[Sentry-plugin] WARNING: Missing "authToken" option. Will not create release.');
    return Promise.resolve("nothing to do here");
  } else if (org === undefined) {
    // eslint-disable-next-line no-console
    console.log('[Sentry-plugin] WARNING: Missing "org" option. Will not create release.');
    return Promise.resolve("nothing to do here");
  } else if (url === undefined) {
    // eslint-disable-next-line no-console
    console.log('[Sentry-plugin] WARNING: Missing "url" option. Will not create release.');
    return Promise.resolve("nothing to do here");
  } else if (project === undefined) {
    // eslint-disable-next-line no-console
    console.log('[Sentry-plugin] WARNING: Missing "project" option. Will not create release.');
    return Promise.resolve("nothing to do here");
  }

  // eslint-disable-next-line no-console
  console.log("[Sentry-plugin] Uploading Sourcemaps.");

  //TODO: Remove this once we have internal options. this property must always be present
  const fileExtensions = ext || [];
  const files = getFiles(include, fileExtensions);

  // eslint-disable-next-line no-console
  console.log(`[Sentry-plugin] > Found ${files.length} files to upload.`);

  return Promise.all(
    files.map((file) =>
      uploadReleaseFile({
        org,
        project,
        release,
        authToken,
        sentryUrl: url,
        filename: file.name,
        fileContent: file.content,
      })
    )
  ).then(() => {
    // eslint-disable-next-line no-console
    console.log("[Sentry-plugin] Successfully uploaded sourcemaps.");
    return "done";
  });
}

async function finalizeRelease(release: string, options: Options): Promise<string> {
  if (options.finalize) {
    const { authToken, org, url, project } = options;
    if (!authToken || !org || !url || !project) {
      // eslint-disable-next-line no-console
      console.log(
        "[Sentry-plugin] WARNING: Missing required option. Will not clean existing artifacts."
      );
      return Promise.resolve("nothing to do here");
    }

    await updateRelease({
      authToken,
      org,
      release,
      sentryUrl: url,
      project,
    });

    // eslint-disable-next-line no-console
    console.log("[Sentry-plugin] Successfully finalized release.");
  }

  return Promise.resolve("nothing to do here");
}

async function cleanArtifacts(release: string, options: Options): Promise<string> {
  if (options.cleanArtifacts) {
    // TODO: pull these checks out of here and simplify them
    if (options.authToken === undefined) {
      // eslint-disable-next-line no-console
      console.log(
        '[Sentry-plugin] WARNING: Missing "authToken" option. Will not clean existing artifacts.'
      );
      return Promise.resolve("nothing to do here");
    } else if (options.org === undefined) {
      // eslint-disable-next-line no-console
      console.log(
        '[Sentry-plugin] WARNING: Missing "org" option. Will not clean existing artifacts.'
      );
      return Promise.resolve("nothing to do here");
    } else if (options.url === undefined) {
      // eslint-disable-next-line no-console
      console.log(
        '[Sentry-plugin] WARNING: Missing "url" option. Will not clean existing artifacts.'
      );
      return Promise.resolve("nothing to do here");
    } else if (options.project === undefined) {
      // eslint-disable-next-line no-console
      console.log(
        '[Sentry-plugin] WARNING: Missing "project" option. Will not clean existing artifacts.'
      );
      return Promise.resolve("nothing to do here");
    }

    await deleteAllReleaseArtifacts({
      authToken: options.authToken,
      org: options.org,
      release,
      sentryUrl: options.url,
      project: options.project,
    });

    // eslint-disable-next-line no-console
    console.log("[Sentry-plugin] Successfully cleaned previous artifacts.");
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
