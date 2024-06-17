import { Hub, NodeClient } from "@sentry/node";
import { UnpluginOptions } from "unplugin";
import { Logger } from "../sentry/logger";
import { safeFlushTelemetry } from "../sentry/telemetry";

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
          "Sending telemetry data on issues and performance to Sentry. To disable telemetry, set `options.telemetry` to `false`."
        );
        sentryHub.startTransaction({ name: "Sentry Bundler Plugin execution" }).finish();
        await safeFlushTelemetry(sentryClient);
      }
    },
  };
}
