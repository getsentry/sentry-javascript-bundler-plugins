import { SeverityLevel, Hub } from "@sentry/node";

interface LoggerOptions {
  silent?: boolean;
  hub: Hub;
  prefix: string;
}

export type Logger = {
  info(message: string, ...params: unknown[]): void;
  warn(message: string, ...params: unknown[]): void;
  error(message: string, ...params: unknown[]): void;
  debug(message: string, ...params: unknown[]): void;
};

export function createLogger(options: LoggerOptions): Logger {
  function addBreadcrumb(level: SeverityLevel, message: string) {
    options.hub.addBreadcrumb({
      category: "logger",
      level,
      message,
    });
  }

  return {
    info(message: string, ...params: unknown[]) {
      if (!options?.silent) {
        // eslint-disable-next-line no-console
        console.log(`${options.prefix} Info: ${message}`, ...params);
      }

      addBreadcrumb("info", message);
    },
    warn(message: string, ...params: unknown[]) {
      if (!options?.silent) {
        // eslint-disable-next-line no-console
        console.log(`${options.prefix} Warning: ${message}`, ...params);
      }

      addBreadcrumb("warning", message);
    },
    error(message: string, ...params: unknown[]) {
      if (!options?.silent) {
        // eslint-disable-next-line no-console
        console.log(`${options.prefix} Error: ${message}`, ...params);
      }

      addBreadcrumb("error", message);
    },

    debug(message: string, ...params: unknown[]) {
      if (!options?.silent) {
        // eslint-disable-next-line no-console
        console.log(`${options.prefix} Debug: ${message}`, ...params);
      }

      addBreadcrumb("debug", message);
    },
  };
}
