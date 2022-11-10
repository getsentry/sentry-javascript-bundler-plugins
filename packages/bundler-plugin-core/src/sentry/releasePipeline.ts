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

  await ctx.cli.releases.new(options.release);

  ctx.logger.info("Successfully created release.");
  span?.finish();
}

export async function uploadSourceMaps(options: InternalOptions, ctx: BuildContext): Promise<void> {
  const span = addSpanToTransaction(ctx, "function.plugin.upload_sourcemaps");
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
    await ctx.cli.releases.execute(["releases", "files", options.release, "delete", "--all"], true);
    ctx.logger.info("Successfully cleaned previous artifacts.");
  }

  span?.finish();
}

export async function setCommits(options: InternalOptions, ctx: BuildContext): Promise<void> {
  const span = addSpanToTransaction(ctx, "function.plugin.set_commits");

  if (options.setCommits) {
    const { auto, repo, commit, previousCommit, ignoreMissing, ignoreEmpty } = options.setCommits;

    await ctx.cli.releases.setCommits(options.release, {
      commit,
      previousCommit,
      repo,
      auto,
      ignoreMissing,
      ignoreEmpty,
    });

    ctx.logger.info("Successfully set commits.");
  }

  span?.finish();
}

export async function addDeploy(options: InternalOptions, ctx: BuildContext): Promise<void> {
  const span = addSpanToTransaction(ctx, "function.plugin.deploy");

  if (options.deploy) {
    const { env, started, finished, time, name, url } = options.deploy;

    await ctx.cli.releases.newDeploy(options.release, {
      env,
      started,
      finished,
      time,
      name,
      url,
    });

    ctx.logger.info("Successfully added deploy.");
  }

  span?.finish();
}
