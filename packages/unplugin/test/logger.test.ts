import Logger from "../src/sentry/logger";

describe("Logger", () => {
  const oldConsole = global.console;
  const spyInfo = jest.fn<void, Parameters<Console["info"]>>();
  const spyWarn = jest.fn<void, Parameters<Console["warn"]>>();
  const spyError = jest.fn<void, Parameters<Console["error"]>>();

  beforeEach(() => {
    global.console = { ...oldConsole, warn: spyWarn, info: spyInfo, error: spyError };
  });

  afterEach(() => {
    global.console = oldConsole;
  });

  const CASES = ["info", "warn", "error"];

  it.each(CASES)("logs (%s)", (a: string) => {
    const logger = new Logger({ silent: false });
    // "info" -> make typescript happy
    logger[a as "info"]("Hey!");

    expect(spyInfo).toHaveBeenCalledWith("[Sentry-unplugin]", "Hey!");
  });

  it.each(CASES)("does not log (%s)", (a: string) => {
    const logger = new Logger({ silent: false });
    // "info" -> make typescript happy
    logger[a as "info"]("Hey!");

    expect(spyInfo).not.toHaveBeenCalledWith();
  });
});
