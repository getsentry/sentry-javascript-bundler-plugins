import { Hub, NodeClient } from "@sentry/node";
import { UnpluginOptions } from "unplugin";
import { Logger } from "../sentry/logger";

interface TelemetryPluginOptions {
  sentryHub: Hub;
  sentryClient: NodeClient;
  shouldSendTelemetry: Promise<boolean>;
  logger: Logger;
}

export function telemetryPlugin({
  sentryHub,
  sentryClient,
  shouldSendTelemetry,
  logger,
}: TelemetryPluginOptions): UnpluginOptions {
  return {
    name: "sentry-telemetry-plugin",
    async buildStart() {
      if (await shouldSendTelemetry) {
        logger.info(
          "Sending error and performance telemetry data to Sentry. To disable telemetry, set `options.telemetry` to `false`."
        );
        sentryHub.startTransaction({ name: "Sentry Bundler Plugin execution" }).finish();
        await sentryClient.flush(3000);
      }
    },
  };
}
