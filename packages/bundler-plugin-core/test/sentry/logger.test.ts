import { createLogger } from "../../src/sentry/logger";

describe("Logger", () => {
  const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
  const consoleInfoSpy = jest.spyOn(console, "info").mockImplementation(() => undefined);
  const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined);
  const consoleDebugSpy = jest.spyOn(console, "debug").mockImplementation(() => undefined);

  afterEach(() => {
    consoleErrorSpy.mockReset();
    consoleInfoSpy.mockReset();
    consoleWarnSpy.mockReset();
    consoleDebugSpy.mockReset();
  });

  it.each([
    ["info", "Info", consoleInfoSpy],
    ["warn", "Warning", consoleWarnSpy],
    ["error", "Error", consoleErrorSpy],
  ] as const)(".%s() should log correctly", (loggerMethod, logLevel, consoleSpy) => {
    const prefix = "[some-prefix]";
    const logger = createLogger({ prefix, silent: false, debug: true });

    logger[loggerMethod]("Hey!");

    expect(consoleSpy).toHaveBeenCalledWith(`[some-prefix] ${logLevel}: Hey!`);
  });

  it.each([
    ["info", "Info", consoleInfoSpy],
    ["warn", "Warning", consoleWarnSpy],
    ["error", "Error", consoleErrorSpy],
  ] as const)(
    ".%s() should log multiple params correctly",
    (loggerMethod, logLevel, consoleSpy) => {
      const prefix = "[some-prefix]";
      const logger = createLogger({ prefix, silent: false, debug: true });

      logger[loggerMethod]("Hey!", "this", "is", "a test with", 5, "params");

      expect(consoleSpy).toHaveBeenCalledWith(
        `[some-prefix] ${logLevel}: Hey!`,
        "this",
        "is",
        "a test with",
        5,
        "params"
      );
    }
  );

  it(".debug() should log correctly", () => {
    const prefix = "[some-prefix]";
    const logger = createLogger({ prefix, silent: false, debug: true });

    logger.debug("Hey!");

    expect(consoleDebugSpy).toHaveBeenCalledWith(`[some-prefix] Debug: Hey!`);
  });

  it(".debug() should log multiple params correctly", () => {
    const prefix = "[some-prefix]";
    const logger = createLogger({ prefix, silent: false, debug: true });

    logger.debug("Hey!", "this", "is", "a test with", 5, "params");

    expect(consoleDebugSpy).toHaveBeenCalledWith(
      `[some-prefix] Debug: Hey!`,
      "this",
      "is",
      "a test with",
      5,
      "params"
    );
  });

  describe("doesn't log when `silent` option is `true`", () => {
    it.each([
      ["info", consoleInfoSpy],
      ["warn", consoleWarnSpy],
      ["error", consoleErrorSpy],
    ] as const)(".%s()", (loggerMethod, consoleSpy) => {
      const prefix = "[some-prefix]";
      const logger = createLogger({ prefix, silent: true, debug: true });

      logger[loggerMethod]("Hey!");

      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  it(".debug() doesn't log when `silent` option is `true`", () => {
    const prefix = "[some-prefix]";
    const logger = createLogger({ prefix, silent: true, debug: true });

    logger.debug("Hey!");

    expect(consoleDebugSpy).not.toHaveBeenCalled();
  });
});
