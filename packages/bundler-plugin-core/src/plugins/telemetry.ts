import { NodeClient, Transaction } from "@sentry/node";
import { UnpluginOptions } from "unplugin";
import { Logger } from "../sentry/logger";

interface TelemetryPluginOptions {
  sentryClient: NodeClient;
  unpluginExecutionTransaction: Transaction;
  telemetryPending: Promise<void>;
  shouldSendTelemetry: Promise<boolean>;
  logger: Logger;
}

export function telemetryPlugin({
  sentryClient,
  telemetryPending,
  unpluginExecutionTransaction,
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
      unpluginExecutionTransaction.startTimestamp = Date.now() / 1000;
    },
    async writeBundle() {
      await telemetryPending;
      unpluginExecutionTransaction.finish();
      await sentryClient.flush();
    },
  };
}
