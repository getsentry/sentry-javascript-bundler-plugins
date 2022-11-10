// Build a facade that exposes necessary sentry functionality
// Idea: We start out with Sentry-CLI and replace the cli-commands one by one afterwards.
// Goal: eventually replace everything sentry-cli does with "native" code here
// Reason: We don't want to depend on a binary that gets downloaded in a postinstall hook
//           - no fixed version
//           - huge download
//           - unnecessary functionality

import { InternalOptions } from "../options-mapping";
import { BuildContext } from "../types";
import { addSpanToTransaction } from "./telemetry";

export async function createNewRelease(options: InternalOptions, ctx: BuildContext): Promise<void> {
  const span = addSpanToTransaction(ctx, "function.plugin.create_release");

  // TODO: pull these checks out of here and simplify them
  if (options.authToken === undefined) {
    ctx.logger.warn('Missing "authToken" option. Will not create release.');
    return;
  } else if (options.org === undefined) {
    ctx.logger.warn('Missing "org" option. Will not create release.');
    return;
  } else if (options.project === undefined) {
    ctx.logger.warn('Missing "project" option. Will not create release.');
    return;
  }

  await ctx.cli.releases.new(options.release);

  ctx.logger.info("Successfully created release.");

  span?.finish();
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
  } else if (options.project === undefined) {
    ctx.logger.warn('Missing "project" option. Will not create release.');
    return Promise.resolve();
  }

  ctx.logger.info("Uploading Sourcemaps.");

  // Since our internal include entries contain all top-level sourcemaps options,
  // we only need to pass the include option here.
  await ctx.cli.releases.uploadSourceMaps(options.release, { include: options.include });

  ctx.logger.info("Successfully uploaded Sourcemaps.");

  span?.finish();
}

export async function finalizeRelease(options: InternalOptions, ctx: BuildContext): Promise<void> {
  const span = addSpanToTransaction(ctx, "function.plugin.finalize_release");

  if (options.finalize) {
    await ctx.cli.releases.finalize(options.release);
    ctx.logger.info("Successfully finalized release.");
  }

  span?.finish();
}

export async function cleanArtifacts(options: InternalOptions, ctx: BuildContext): Promise<void> {
  const span = addSpanToTransaction(ctx, "function.plugin.clean_artifacts");

  if (options.cleanArtifacts) {
    // TODO: pull these checks out of here and simplify them
    if (options.authToken === undefined) {
      ctx.logger.warn('Missing "authToken" option. Will not clean existing artifacts.');
      return;
    } else if (options.org === undefined) {
      ctx.logger.warn('Missing "org" option. Will not clean existing artifacts.');
      return;
    } else if (options.project === undefined) {
      ctx.logger.warn('Missing "project" option. Will not clean existing artifacts.');
      return;
    }

    await ctx.cli.releases.execute(["releases", "files", options.release, "delete", "--all"], true);

    ctx.logger.info("Successfully cleaned previous artifacts.");
  }

  span?.finish();
}

export async function setCommits(options: InternalOptions, ctx: BuildContext): Promise<void> {
  const span = addSpanToTransaction(ctx, "function.plugin.set_commits");

  if (options.setCommits) {
    const { auto, repo, commit, previousCommit, ignoreMissing, ignoreEmpty } = options.setCommits;

    if (auto || (repo && commit)) {
      await ctx.cli.releases.setCommits(options.release, {
        commit,
        previousCommit,
        repo,
        auto,
        ignoreMissing,
        ignoreEmpty,
      });
      ctx.logger.info("Successfully set commits.");
    } else {
      ctx.logger.error(
        "Couldn't set commits - neither the `auto` nor the `repo` and `commit` options were specified!",
        "Make sure to either set `auto` to `true` or to manually set `repo` and `commit`."
      );
    }
  }

  span?.finish();
}

export async function addDeploy(options: InternalOptions, ctx: BuildContext): Promise<void> {
  const span = addSpanToTransaction(ctx, "function.plugin.deploy");

  if (options.deploy) {
    const { env, started, finished, time, name, url } = options.deploy;

    if (env) {
      await ctx.cli.releases.newDeploy(options.release, {
        env,
        started,
        finished,
        time,
        name,
        url,
      });
      ctx.logger.info("Successfully added deploy.");
    } else {
      ctx.logger.error(
        "Couldn't add deploy - the `env` option was not specified!",
        "Make sure to set `deploy.env` (e.g. to 'production')."
      );
    }
  }

  span?.finish();
}
