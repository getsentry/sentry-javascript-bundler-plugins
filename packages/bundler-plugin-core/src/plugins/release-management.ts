import SentryCli, { SentryCliCommitsOptions, SentryCliNewDeployOptions } from "@sentry/cli";
import { Hub, NodeClient } from "@sentry/node";
import { UnpluginOptions } from "unplugin";
import { Logger } from "../sentry/logger";
import { safeFlushTelemetry } from "../sentry/telemetry";
import { IncludeEntry } from "../types";
import { arrayify } from "../utils";

interface ReleaseManagementPluginOptions {
  logger: Logger;
  releaseName: string;
  shouldCreateRelease: boolean;
  shouldFinalizeRelease: boolean;
  include?: string | IncludeEntry | Array<string | IncludeEntry>;
  setCommitsOption?: SentryCliCommitsOptions;
  deployOptions?: SentryCliNewDeployOptions;
  dist?: string;
  handleRecoverableError: (error: unknown) => void;
  sentryHub: Hub;
  sentryClient: NodeClient;
  sentryCliOptions: {
    url: string;
    authToken: string;
    org?: string;
    project: string;
    vcsRemote: string;
    silent: boolean;
    headers?: Record<string, string>;
  };
  deleteFilesUpForDeletion: () => Promise<void>;
}

export function releaseManagementPlugin({
  releaseName,
  include,
  dist,
  setCommitsOption,
  shouldCreateRelease,
  shouldFinalizeRelease,
  deployOptions,
  handleRecoverableError,
  sentryHub,
  sentryClient,
  sentryCliOptions,
  deleteFilesUpForDeletion,
}: ReleaseManagementPluginOptions): UnpluginOptions {
  return {
    name: "sentry-debug-id-upload-plugin",
    async writeBundle() {
      try {
        const cliInstance = new SentryCli(null, sentryCliOptions);

        if (shouldCreateRelease) {
          await cliInstance.releases.new(releaseName);
        }

        if (include) {
          const normalizedInclude = arrayify(include)
            .map((includeItem) =>
              typeof includeItem === "string" ? { paths: [includeItem] } : includeItem
            )
            .map((includeEntry) => ({
              ...includeEntry,
              validate: includeEntry.validate ?? false,
              ext: includeEntry.ext
                ? includeEntry.ext.map((extension) => `.${extension.replace(/^\./, "")}`)
                : [".js", ".map", ".jsbundle", ".bundle"],
              ignore: includeEntry.ignore ? arrayify(includeEntry.ignore) : undefined,
            }));

          await cliInstance.releases.uploadSourceMaps(releaseName, {
            include: normalizedInclude,
            dist,
          });
        }

        if (setCommitsOption) {
          await cliInstance.releases.setCommits(releaseName, setCommitsOption);
        }

        if (shouldFinalizeRelease) {
          await cliInstance.releases.finalize(releaseName);
        }

        if (deployOptions) {
          await cliInstance.releases.newDeploy(releaseName, deployOptions);
        }

        await deleteFilesUpForDeletion();
      } catch (e) {
        sentryHub.captureException('Error in "releaseManagementPlugin" writeBundle hook');
        await safeFlushTelemetry(sentryClient);
        handleRecoverableError(e);
      }
    },
  };
}
