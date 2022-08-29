import { Options } from "../types";
import { SeverityLevel } from "@sentry/node";
import { Hub } from "@sentry/node";
interface LoggerI {
  options: Pick<Options, "silent" | "org">;
  hub: Hub;
}
export default function logger(props: LoggerI) {
  const prefix = "[Sentry-unplugin]";

  function addBreadcrumb(level: SeverityLevel, message: string) {
    props.hub.addBreadcrumb({
      category: "logger",
      level,
      message,
    });
  }

  return {
    prefix,
    info(message: string) {
      if (!props.options.silent) {
        // eslint-disable-next-line no-console
        console.info(prefix, message);
      }

      addBreadcrumb("info", message);
    },
    warn(message: string) {
      if (!props.options.silent) {
        // eslint-disable-next-line no-console
        console.warn(prefix, message);
      }

      addBreadcrumb("warning", message);
    },
    error(message: string) {
      if (!props.options.silent) {
        // eslint-disable-next-line no-console
        console.error(prefix, message);
      }

      addBreadcrumb("error", message);
    },
  };
}
