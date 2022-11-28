import { createLogger } from "../../src/sentry/logger";

describe("Logger", () => {
  const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);

  afterEach(() => {
    consoleLogSpy.mockReset();
  });

  it.each([
    ["info", "Info"],
    ["warn", "Warning"],
    ["error", "Error"],
  ] as const)(".%s() should log correctly", (loggerMethod, logLevel) => {
    const prefix = "[some-prefix]";
    const logger = createLogger({ prefix, silent: false, debug: true });

    logger[loggerMethod]("Hey!");

    expect(consoleLogSpy).toHaveBeenCalledWith(`[some-prefix] ${logLevel}: Hey!`);
  });

  it.each([
    ["info", "Info"],
    ["warn", "Warning"],
    ["error", "Error"],
  ] as const)(".%s() should log multiple params correctly", (loggerMethod, logLevel) => {
    const prefix = "[some-prefix]";
    const logger = createLogger({ prefix, silent: false, debug: true });

    logger[loggerMethod]("Hey!", "this", "is", "a test with", 5, "params");

    expect(consoleLogSpy).toHaveBeenCalledWith(
      `[some-prefix] ${logLevel}: Hey!`,
      "this",
      "is",
      "a test with",
      5,
      "params"
    );
  });

  it(".debug() should log correctly", () => {
    const prefix = "[some-prefix]";
    const logger = createLogger({ prefix, silent: false, debug: true });

    logger.debug("Hey!");

    expect(consoleLogSpy).toHaveBeenCalledWith(`[some-prefix] Debug: Hey!`);
  });

  it(".debug() should log multiple params correctly", () => {
    const prefix = "[some-prefix]";
    const logger = createLogger({ prefix, silent: false, debug: true });

    logger.debug("Hey!", "this", "is", "a test with", 5, "params");

    expect(consoleLogSpy).toHaveBeenCalledWith(
      `[some-prefix] Debug: Hey!`,
      "this",
      "is",
      "a test with",
      5,
      "params"
    );
  });

  describe("doesn't log when `silent` option is `true`", () => {
    it.each(["info", "warn", "error"] as const)(".%s()", (loggerMethod) => {
      const prefix = "[some-prefix]";
      const logger = createLogger({ prefix, silent: true, debug: true });

      logger[loggerMethod]("Hey!");

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  it(".debug() doesn't log when `silent` option is `true`", () => {
    const prefix = "[some-prefix]";
    const logger = createLogger({ prefix, silent: true, debug: true });

    logger.debug("Hey!");

    expect(consoleLogSpy).not.toHaveBeenCalled();
  });
});
