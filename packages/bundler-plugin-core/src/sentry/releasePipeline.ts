// Build a facade that exposes necessary sentry functionality
// Idea: We start out with Sentry-CLI and replace the cli-commands one by one afterwards.
// Goal: eventually replace everything sentry-cli does with "native" code here
// Reason: We don't want to depend on a binary that gets downloaded in a postinstall hook
//           - no fixed version
//           - huge download
//           - unnecessary functionality

import { InternalOptions } from "../options-mapping";
import { BuildContext } from "../types";
import { createRelease, deleteAllReleaseArtifacts, updateRelease } from "./api";
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

export async function uploadSourceMaps(options: InternalOptions, ctx: BuildContext): Promise<void> {
  const span = addSpanToTransaction(ctx, "function.plugin.upload_sourcemaps");

  // TODO: pull these checks out of here and simplify them
  if (options.authToken === undefined) {
    ctx.logger.warn('Missing "authToken" option. Will not create release.');
    return Promise.resolve();
  } else if (options.org === undefined) {
    ctx.logger.warn('Missing "org" option. Will not create release.');
    return Promise.resolve();
  } else if (options.url === undefined) {
    ctx.logger.warn('Missing "url" option. Will not create release.');
    return Promise.resolve();
  } else if (options.project === undefined) {
    ctx.logger.warn('Missing "project" option. Will not create release.');
    return Promise.resolve();
  }

  ctx.logger.info("Uploading Sourcemaps.");

  await ctx.cli.releases.uploadSourceMaps(options.release, { include: options.include });

  ctx.logger.info("Successfully uploaded Sourcemaps.");

  span?.finish();
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
