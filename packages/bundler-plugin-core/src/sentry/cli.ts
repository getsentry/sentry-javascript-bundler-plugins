import SentryCli, { SentryCliReleases } from "@sentry/cli";
import { InternalOptions } from "../options-mapping";
import { Logger } from "./logger";

type SentryDryRunCLI = { releases: Omit<SentryCliReleases, "listDeploys"> };
export type SentryCLILike = SentryCli | SentryDryRunCLI;

/**
 * Creates a new Sentry CLI instance.
 *
 * In case, users selected the `dryRun` options, this returns a stub
 * that makes no-ops out of most CLI operations
 */
export function getSentryCli(internalOptions: InternalOptions, logger: Logger): SentryCLILike {
  const { silent, org, project, authToken, url, vcsRemote, customHeader } = internalOptions;
  const cli = new SentryCli(internalOptions.configFile, {
    silent,
    org,
    project,
    authToken,
    url,
    vcsRemote,
    customHeader,
  });

  if (internalOptions.dryRun) {
    logger.info("In DRY RUN Mode");
    return getDryRunCLI(cli, logger);
  }

  return cli;
}

function getDryRunCLI(cli: SentryCli, logger: Logger): SentryDryRunCLI {
  return {
    releases: {
      proposeVersion: () =>
        cli.releases.proposeVersion().then((version) => {
          logger.info("Proposed version:\n", version);
          return version;
        }),
      new: (release: string) => {
        logger.info("Creating new release:\n", release);
        return Promise.resolve(release);
      },
      uploadSourceMaps: (release: string, config: unknown) => {
        logger.info("Calling upload-sourcemaps with:\n", config);
        return Promise.resolve(release);
      },
      finalize: (release: string) => {
        logger.info("Finalizing release:\n", release);
        return Promise.resolve(release);
      },
      setCommits: (release: string, config: unknown) => {
        logger.info("Calling set-commits with:\n", config);
        return Promise.resolve(release);
      },
      newDeploy: (release: string, config: unknown) => {
        logger.info("Calling deploy with:\n", config);
        return Promise.resolve(release);
      },
      execute: (args: string[], live: boolean) => {
        logger.info("Executing", args, "live:", live);
        return Promise.resolve("");
      },
    },
  };
}
