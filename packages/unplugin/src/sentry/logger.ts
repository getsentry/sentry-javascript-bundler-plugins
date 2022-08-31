import { SeverityLevel, Hub } from "@sentry/node";

interface LoggerOptions {
  silent?: boolean;
  hub: Hub;
  prefix: string;
}

export function createLogger(options: LoggerOptions) {
  function addBreadcrumb(level: SeverityLevel, message: string) {
    options.hub.addBreadcrumb({
      category: "logger",
      level,
      message,
    });
  }

  return {
    info(message: string) {
      if (!options?.silent) {
        // eslint-disable-next-line no-console
        console.log(`${options.prefix} ${message}`);
      }

      addBreadcrumb("info", message);
    },
    warn(message: string) {
      if (!options?.silent) {
        // eslint-disable-next-line no-console
        console.log(`${options.prefix} Warning! ${message}`);
      }

      addBreadcrumb("warning", message);
    },
    error(message: string) {
      if (!options?.silent) {
        // eslint-disable-next-line no-console
        console.log(`${options.prefix} Error: ${message}`);
      }

      addBreadcrumb("error", message);
    },
  };
}
