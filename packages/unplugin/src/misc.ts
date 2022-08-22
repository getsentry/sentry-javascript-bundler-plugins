import { Options } from "./types";

type Logger = {
  debug(...args: any): void;
};

export function makeLogger(options: Options): Logger {
  return {
    debug: (...args: any) => {
      if (options.debugLogging) {
        // eslint-disable-next-line no-console
        console.log("[Sentry-plugin]", args);
      }
    },
  };
}
