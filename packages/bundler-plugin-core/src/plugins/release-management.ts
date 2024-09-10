import SentryCli, { SentryCliCommitsOptions, SentryCliNewDeployOptions } from "@sentry/cli";
import { Scope } from "@sentry/core";
import { UnpluginOptions } from "unplugin";
import { Logger } from "../sentry/logger";
import { safeFlushTelemetry } from "../sentry/telemetry";
import { IncludeEntry } from "../types";
import { arrayify } from "../utils";
import { Client } from "@sentry/types";

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
  sentryScope: Scope;
  sentryClient: Client;
  sentryCliOptions: {
    url: string;
    authToken: string;
    org?: string;
    project: string;
    vcsRemote: string;
    silent: boolean;
    headers?: Record<string, string>;
  };
  createDependencyOnSourcemapFiles: () => () => void;
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
  sentryScope,
  sentryClient,
  sentryCliOptions,
  createDependencyOnSourcemapFiles,
}: ReleaseManagementPluginOptions): UnpluginOptions {
  const freeGlobalDependencyOnSourcemapFiles = createDependencyOnSourcemapFiles();
  return {
    name: "sentry-debug-id-upload-plugin",
    async writeBundle() {
      // It is possible that this writeBundle hook is called multiple times in one build (for example when reusing the plugin, or when using build tooling like `@vitejs/plugin-legacy`)
      // Therefore we need to actually register the execution of this hook as dependency on the sourcemap files.
      const freeWriteBundleInvocationDependencyOnSourcemapFiles =
        createDependencyOnSourcemapFiles();

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
      } catch (e) {
        sentryScope.captureException('Error in "releaseManagementPlugin" writeBundle hook');
        await safeFlushTelemetry(sentryClient);
        handleRecoverableError(e);
      } finally {
        freeGlobalDependencyOnSourcemapFiles();
        freeWriteBundleInvocationDependencyOnSourcemapFiles();
      }
    },
  };
}
