import { UnpluginOptions } from "unplugin";
import { SentryBuildPluginManager } from "../api-primitives";

interface FileDeletionPlugin {
  sentryBuildPluginManager: SentryBuildPluginManager;
}

export function fileDeletionPlugin({
  sentryBuildPluginManager,
}: FileDeletionPlugin): UnpluginOptions {
  return {
    name: "sentry-file-deletion-plugin",
    async writeBundle() {
      await sentryBuildPluginManager.deleteArtifacts();
    },
  };
}
