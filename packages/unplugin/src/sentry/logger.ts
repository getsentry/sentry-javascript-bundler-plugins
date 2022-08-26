interface LoggerI {
  isSilent: boolean;
}

export default class Logger {
  private isSilent = false;
  private signature = "[Sentry-unplugin]";

  constructor(props: LoggerI) {
    this.isSilent = props.isSilent;
  }

  public info(...args: unknown[]) {
    if (!this.isSilent) {
      // eslint-disable-next-line no-console
      console.info(this.signature, ...args);
    }
  }

  public warn(...args: unknown[]) {
    if (!this.isSilent) {
      // eslint-disable-next-line no-console
      console.warn(this.signature, ...args);
    }
  }

  public error(...args: unknown[]) {
    if (!this.isSilent) {
      // eslint-disable-next-line no-console
      console.error(this.signature, ...args);
    }
  }
}
