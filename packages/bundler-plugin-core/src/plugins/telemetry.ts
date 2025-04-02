import { UnpluginOptions } from "unplugin";
import { SentryBuildPluginManager } from "../api-primitives";

interface TelemetryPluginOptions {
  sentryBuildPluginManager: SentryBuildPluginManager;
}

export function telemetryPlugin({
  sentryBuildPluginManager,
}: TelemetryPluginOptions): UnpluginOptions {
  return {
    name: "sentry-telemetry-plugin",
    async buildStart() {
      await sentryBuildPluginManager.telemetry.emitBundlerPluginExecutionSignal();
    },
  };
}
