import { NodeClient, Transaction } from "@sentry/node";
import { UnpluginOptions } from "unplugin";
import { Logger } from "../sentry/logger";

interface TelemetryPluginOptions {
  sentryClient: NodeClient;
  pluginExecutionTransaction: Transaction;
  shouldSendTelemetry: Promise<boolean>;
  logger: Logger;
}

export function telemetryPlugin({
  sentryClient,
  pluginExecutionTransaction,
  shouldSendTelemetry,
  logger,
}: TelemetryPluginOptions): UnpluginOptions {
  return {
    name: "sentry-telemetry-plugin",
    buildStart() {
      void shouldSendTelemetry.then(() => {
        logger.info(
          "Sending error and performance telemetry data to Sentry. To disable telemetry, set `options.telemetry` to `false`."
        );
      });
      pluginExecutionTransaction.startTimestamp = Date.now() / 1000;
    },
    async writeBundle() {
      pluginExecutionTransaction.finish();
      await sentryClient.flush();
    },
  };
}
