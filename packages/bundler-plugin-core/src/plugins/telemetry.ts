import { Scope, startSpan } from "@sentry/core";
import { Client } from "@sentry/types";
import { UnpluginOptions } from "unplugin";
import { Logger } from "../sentry/logger";
import { safeFlushTelemetry } from "../sentry/telemetry";

interface TelemetryPluginOptions {
  sentryClient: Client;
  sentryScope: Scope;
  shouldSendTelemetry: Promise<boolean>;
  logger: Logger;
}

export function telemetryPlugin({
  sentryClient,
  sentryScope,
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
        startSpan({ name: "Sentry Bundler Plugin execution", scope: sentryScope }, () => {
          //
        });
        await safeFlushTelemetry(sentryClient);
      }
    },
  };
}
