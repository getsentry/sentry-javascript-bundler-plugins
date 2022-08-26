import { makeSentryClient } from "../sentry/telemetry";
import { Options } from "../types";
import { SeverityLevel } from "@sentry/node";

export default function logger(props: Pick<Options, "silent" | "telemetry" | "org">) {
  const signature = "[Sentry-unplugin]";
  const sentryClient = makeSentryClient(
    "https://4c2bae7d9fbc413e8f7385f55c515d51@o1.ingest.sentry.io/6690737",
    !!props.telemetry,
    props.org
  );

  function addBreadcrumb(level: SeverityLevel, message: string) {
    sentryClient.hub.addBreadcrumb({
      category: "logger",
      level,
      message,
    });
  }

  return {
    info(message: string) {
      if (!props.silent) {
        // eslint-disable-next-line no-console
        console.info(signature, message);
      }

      addBreadcrumb("info", message);
    },
    warn(message: string) {
      if (!props.silent) {
        // eslint-disable-next-line no-console
        console.warn(signature, message);
      }

      addBreadcrumb("warning", message);
    },
    error(message: string) {
      if (!props.silent) {
        // eslint-disable-next-line no-console
        console.error(signature, message);
      }

      addBreadcrumb("error", message);
    },
  };
}
