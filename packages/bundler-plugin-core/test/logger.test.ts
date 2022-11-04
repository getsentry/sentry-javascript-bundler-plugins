import { Hub } from "@sentry/node";
import { createLogger } from "../src/sentry/logger";

describe("Logger", () => {
  const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const hub: Hub = {
    addBreadcrumb: () => {
      return;
    },
  };

  const mockedAddBreadcrumb = jest.spyOn(hub, "addBreadcrumb");

  afterEach(() => {
    consoleLogSpy.mockReset();
    mockedAddBreadcrumb.mockReset();
  });

  it.each([
    ["info", "Info"],
    ["warn", "Warning"],
    ["error", "Error"],
    ["debug", "Debug"],
  ] as const)(".%s() should log correctly", (loggerMethod, logLevel) => {
    const prefix = "[some-prefix]";
    const logger = createLogger({ hub, prefix });

    logger[loggerMethod]("Hey!");

    expect(consoleLogSpy).toHaveBeenCalledWith(`[some-prefix] ${logLevel}: Hey!`);
    expect(mockedAddBreadcrumb).toHaveBeenCalledWith({
      category: "logger",
      level: logLevel.toLowerCase(),
      message: "Hey!",
    });
  });

  it.each([
    ["info", "Info"],
    ["warn", "Warning"],
    ["error", "Error"],
    ["debug", "Debug"],
  ] as const)(".%s() should log multiple params correctly", (loggerMethod, logLevel) => {
    const prefix = "[some-prefix]";
    const logger = createLogger({ hub, prefix });

    logger[loggerMethod]("Hey!", "this", "is", "a test with", 5, "params");

    expect(consoleLogSpy).toHaveBeenCalledWith(
      `[some-prefix] ${logLevel}: Hey!`,
      "this",
      "is",
      "a test with",
      5,
      "params"
    );
    expect(mockedAddBreadcrumb).toHaveBeenCalledWith({
      category: "logger",
      level: logLevel.toLowerCase(),
      message: "Hey!",
    });
  });

  describe("doesn't log when `silent` option is `true`", () => {
    it.each(["info", "warn", "error"] as const)(".%s()", (loggerMethod) => {
      const prefix = "[some-prefix]";
      const logger = createLogger({ silent: true, hub, prefix });

      logger[loggerMethod]("Hey!");

      expect(consoleLogSpy).not.toHaveBeenCalled();

      expect(mockedAddBreadcrumb).toHaveBeenCalledWith({
        category: "logger",
        level: expect.stringMatching(/.*/) as string,
        message: "Hey!",
      });
    });
  });
});
