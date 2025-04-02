import { UnpluginOptions } from "unplugin";
import { SentryBuildPluginManager } from "../api-primitives";

interface ReleaseManagementPluginOptions {
  sentryBuildPluginManager: SentryBuildPluginManager;
}

/**
 * Creates a plugin that creates releases, sets commits, deploys and finalizes releases.
 *
 * Additionally, if legacy upload options are set, it uploads source maps in the legacy (non-debugId) way.
 */
export function releaseManagementPlugin({
  sentryBuildPluginManager,
}: ReleaseManagementPluginOptions): UnpluginOptions {
  const freeGlobalDependencyOnBuildArtifacts =
    sentryBuildPluginManager.createDependencyOnBuildArtifacts();
  return {
    name: "sentry-release-management-plugin",
    async writeBundle() {
      try {
        await sentryBuildPluginManager.createRelease();
      } finally {
        freeGlobalDependencyOnBuildArtifacts();
      }
    },
  };
}
