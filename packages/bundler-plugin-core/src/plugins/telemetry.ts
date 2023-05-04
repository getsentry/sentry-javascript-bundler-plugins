import { NodeClient, Transaction } from "@sentry/node";
import { EventEmitter } from "events";
import { UnpluginOptions } from "unplugin";
import { Logger } from "../sentry/logger";

interface TelemetryPluginOptions {
  sentryClient: NodeClient;
  unpluginExecutionTransaction: Transaction;
  telemetryWorkersDoneEmitter: EventEmitter;
  shouldSendTelemetry: Promise<boolean>;
  telemetryWorkers: Set<symbol>;
  logger: Logger;
}

export function telemetryPlugin({
  sentryClient,
  telemetryWorkers,
  unpluginExecutionTransaction,
  shouldSendTelemetry,
  telemetryWorkersDoneEmitter,
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
      await new Promise<void>((resolve) => {
        if (telemetryWorkers.size === 0) {
          resolve();
        }

        const doneHandler = () => {
          if (telemetryWorkers.size === 0) {
            resolve();
            telemetryWorkersDoneEmitter.off("done", doneHandler);
          }
        };

        telemetryWorkersDoneEmitter.on("done", doneHandler);
      });

      unpluginExecutionTransaction.finish();
      await sentryClient.flush();
    },
  };
}
