// Build a facade that exposes necessary sentry functionality
// Idea: We start out with Sentry-CLI and replace the cli-commands one by one afterwards.
// Goal: eventually replace everything sentry-cli does with "native" code here
// Reason: We don't want to depend on a binary that gets downloaded in a postinstall hook
//           - no fixed version
//           - huge download
//           - unnecessary functionality

import { InternalOptions } from "../options-mapping";
import { BuildContext } from "../types";
import { createRelease, deleteAllReleaseArtifacts, uploadReleaseFile, updateRelease } from "./api";
import { getFiles, FileRecord } from "./sourcemaps";
import { addSpanToTransaction } from "./telemetry";

export async function createNewRelease(
  options: InternalOptions,
  ctx: BuildContext
): Promise<string> {
  const span = addSpanToTransaction(ctx, "function.plugin.create_release");

  // TODO: pull these checks out of here and simplify them
  if (options.authToken === undefined) {
    ctx.logger.warn('Missing "authToken" option. Will not create release.');
    return Promise.resolve("nothing to do here");
  } else if (options.org === undefined) {
    ctx.logger.warn('Missing "org" option. Will not create release.');
    return Promise.resolve("nothing to do here");
  } else if (options.url === undefined) {
    ctx.logger.warn('Missing "url" option. Will not create release.');
    return Promise.resolve("nothing to do here");
  } else if (options.project === undefined) {
    ctx.logger.warn('Missing "project" option. Will not create release.');
    return Promise.resolve("nothing to do here");
  }

  await createRelease({
    release: options.release,
    authToken: options.authToken,
    org: options.org,
    project: options.project,
    sentryUrl: options.url,
    sentryHub: ctx.hub,
    customHeader: options.customHeader,
  });

  ctx.logger.info("Successfully created release.");

  span?.finish();
  return Promise.resolve("nothing to do here");
}

export async function uploadSourceMaps(
  options: InternalOptions,
  ctx: BuildContext
): Promise<string> {
  const span = addSpanToTransaction(ctx, "function.plugin.upload_sourcemaps");
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

  // TODO: pull these checks out of here and simplify them
  if (options.authToken === undefined) {
    ctx.logger.warn('Missing "authToken" option. Will not create release.');
    return Promise.resolve("nothing to do here");
  } else if (options.org === undefined) {
    ctx.logger.warn('Missing "org" option. Will not create release.');
    return Promise.resolve("nothing to do here");
  } else if (options.url === undefined) {
    ctx.logger.warn('Missing "url" option. Will not create release.');
    return Promise.resolve("nothing to do here");
  } else if (options.project === undefined) {
    ctx.logger.warn('Missing "project" option. Will not create release.');
    return Promise.resolve("nothing to do here");
  }

  ctx.logger.info("Uploading Sourcemaps.");

  const files: FileRecord[] = [];
  options.include.forEach((includeEntry) => {
    includeEntry.paths.forEach((path) => {
      files.push(...getFiles(path, includeEntry));
    });
  });

  ctx.logger.info(`Found ${files.length} files to upload.`);

  // Check if there would be duplicate artifacts and throw if there are any.
  const duplicateArtifacts = new Set<string>();
  const fileSet = new Set<string>();
  files.forEach((file) => {
    if (fileSet.has(file.name)) {
      duplicateArtifacts.add(file.name);
    } else {
      fileSet.add(file.name);
    }
  });
  if (duplicateArtifacts.size > 0) {
    const artifactsList: string[] = [];
    duplicateArtifacts.forEach((artifact) => {
      artifactsList.push(`- "${artifact}"`);
    });
    ctx.logger.error(
      `The following artifacts were identified more than once. Use the "urlPrefix" or "urlSuffix" options to tell them apart or adjust your "include" and "ignore" settings.\n${artifactsList.join(
        "\n"
      )}`
    );
    throw new Error();
  }

  return Promise.all(
    files.map((file) =>
      uploadReleaseFile({
        org: options.org,
        project: options.project,
        release: options.release,
        authToken: options.authToken,
        sentryUrl: options.url,
        filename: file.name,
        fileContent: file.content,
        sentryHub: ctx.hub,
        customHeader: options.customHeader,
      })
    )
  ).then(() => {
    ctx.logger.info("Successfully uploaded sourcemaps.");
    span?.finish();
    return "done";
  });
}

export async function finalizeRelease(
  options: InternalOptions,
  ctx: BuildContext
): Promise<string> {
  const span = addSpanToTransaction(ctx, "function.plugin.finalize_release");

  if (options.finalize) {
    const { authToken, org, url, project } = options;
    if (!authToken || !org || !url || !project) {
      ctx.logger.warn("Missing required option. Will not clean existing artifacts.");
      return Promise.resolve("nothing to do here");
    }

    await updateRelease({
      authToken,
      org,
      release: options.release,
      sentryUrl: url,
      project,
      sentryHub: ctx.hub,
      customHeader: options.customHeader,
    });

    ctx.logger.info("Successfully finalized release.");
  }

  span?.finish();
  return Promise.resolve("nothing to do here");
}

export async function cleanArtifacts(options: InternalOptions, ctx: BuildContext): Promise<string> {
  const span = addSpanToTransaction(ctx, "function.plugin.clean_artifacts");

  if (options.cleanArtifacts) {
    // TODO: pull these checks out of here and simplify them
    if (options.authToken === undefined) {
      ctx.logger.warn('Missing "authToken" option. Will not clean existing artifacts.');
      return Promise.resolve("nothing to do here");
    } else if (options.org === undefined) {
      ctx.logger.warn('Missing "org" option. Will not clean existing artifacts.');
      return Promise.resolve("nothing to do here");
    } else if (options.url === undefined) {
      ctx.logger.warn('Missing "url" option. Will not clean existing artifacts.');
      return Promise.resolve("nothing to do here");
    } else if (options.project === undefined) {
      ctx.logger.warn('Missing "project" option. Will not clean existing artifacts.');
      return Promise.resolve("nothing to do here");
    }

    await deleteAllReleaseArtifacts({
      authToken: options.authToken,
      org: options.org,
      release: options.release,
      sentryUrl: options.url,
      project: options.project,
      sentryHub: ctx.hub,
      customHeader: options.customHeader,
    });

    ctx.logger.info("Successfully cleaned previous artifacts.");
  }

  span?.finish();
  return Promise.resolve("nothing to do here");
}

// TODO: Stuff we worry about later:

export async function setCommits(
  /* version: string, */
  ctx: BuildContext
): Promise<string> {
  const span = addSpanToTransaction(ctx, "function.plugin.set_commits");

  span?.finish();
  return Promise.resolve("Noop");
}

export async function addDeploy(
  /* version: string, */
  ctx: BuildContext
): Promise<string> {
  const span = addSpanToTransaction(ctx, "function.plugin.add_deploy");

  span?.finish();
  return Promise.resolve("Noop");
}
