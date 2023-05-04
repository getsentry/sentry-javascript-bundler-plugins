import { SentryCliCommitsOptions, SentryCliNewDeployOptions } from "@sentry/cli";
import { Hub, NodeClient } from "@sentry/node";
import { UnpluginOptions } from "unplugin";
import { InternalIncludeEntry } from "../options-mapping";
import { SentryCLILike } from "../sentry/cli";
import { Logger } from "../sentry/logger";

interface DebugIdUploadPluginOptions {
  logger: Logger;
  cliInstance: SentryCLILike;
  releaseName: string;
  shouldCleanArtifacts: boolean;
  shouldUploadSourceMaps: boolean;
  shouldFinalizeRelease: boolean;
  include: InternalIncludeEntry[];
  setCommitsOption?: SentryCliCommitsOptions;
  deployOptions?: SentryCliNewDeployOptions;
  dist?: string;
  handleRecoverableError: (error: unknown) => void;
  sentryHub: Hub;
  sentryClient: NodeClient;
}

export function releaseManagementPlugin({
  cliInstance,
  releaseName,
  include,
  dist,
  setCommitsOption,
  shouldCleanArtifacts,
  shouldUploadSourceMaps,
  shouldFinalizeRelease,
  deployOptions,
  handleRecoverableError,
  sentryHub,
  sentryClient,
}: DebugIdUploadPluginOptions): UnpluginOptions {
  return {
    name: "sentry-debug-id-upload-plugin",
    async writeBundle() {
      try {
        await cliInstance.releases.new(releaseName);

        if (shouldCleanArtifacts) {
          await cliInstance.releases.execute(
            ["releases", "files", releaseName, "delete", "--all"],
            true
          );
        }

        if (shouldUploadSourceMaps) {
          await cliInstance.releases.uploadSourceMaps(releaseName, { include, dist });
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
      } catch (e) {
        sentryHub.captureException('Error in "releaseManagementPlugin" writeBundle hook');
        await sentryClient.flush();
        handleRecoverableError(e);
      }
    },
  };
}
