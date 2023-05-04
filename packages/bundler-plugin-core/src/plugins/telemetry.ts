import { NodeClient, Transaction } from "@sentry/node";
import { UnpluginOptions } from "unplugin";
import { Logger } from "../sentry/logger";
import { TelemetryParticipantsManager } from "../sentry/telemetry";

interface TelemetryPluginOptions {
  sentryClient: NodeClient;
  unpluginExecutionTransaction: Transaction;
  telemetryParticipantsManagerPromise: Promise<TelemetryParticipantsManager>;
  shouldSendTelemetry: Promise<boolean>;
  logger: Logger;
}

export function telemetryPlugin({
  sentryClient,
  telemetryParticipantsManagerPromise,
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
      const telemetryParticipantsManager = await telemetryParticipantsManagerPromise;
      await telemetryParticipantsManager.telemetryPending;
      unpluginExecutionTransaction.finish();
      await sentryClient.flush();
    },
  };
}
