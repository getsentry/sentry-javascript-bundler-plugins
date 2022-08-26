import { makeSentryClient } from "../sentry/telemetry";
import { Options } from "../types";
import { SeverityLevel } from "@sentry/node";

export default class Logger {
  private signature = "[Sentry-unplugin]";
  private isSilent = false;
  private sentryClient;

  constructor(props: Pick<Options, "silent" | "telemetry" | "org">) {
    this.isSilent = !!props.silent;

    const sentryClient = makeSentryClient(
      "https://4c2bae7d9fbc413e8f7385f55c515d51@o1.ingest.sentry.io/6690737",
      !!props.telemetry,
      props.org
    );

    this.sentryClient = sentryClient;
  }

  private addBreadcrumb(level: SeverityLevel, message: string) {
    this.sentryClient.hub.addBreadcrumb({
      category: "logger",
      level,
      message,
    });
  }

  public info(message: string) {
    if (!this.isSilent) {
      // eslint-disable-next-line no-console
      console.info(this.signature, message);
    }

    this.addBreadcrumb("info", message);
  }

  public warn(message: string) {
    if (!this.isSilent) {
      // eslint-disable-next-line no-console
      console.warn(this.signature, message);
    }

    this.addBreadcrumb("warning", message);
  }

  public error(message: string) {
    if (!this.isSilent) {
      // eslint-disable-next-line no-console
      console.error(this.signature, message);
    }

    this.addBreadcrumb("error", message);
  }
}
