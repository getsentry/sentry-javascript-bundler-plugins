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

  it(".info() should log correctly", () => {
    const prefix = "[some-prefix]";
    const logger = createLogger({ hub, prefix });
    logger.info("Hey!");

    expect(consoleLogSpy).toHaveBeenCalledWith("[some-prefix] Hey!");
    expect(mockedAddBreadcrumb).toHaveBeenCalledWith({
      category: "logger",
      level: "info",
      message: "Hey!",
    });
  });

  it(".warn() should log correctly", () => {
    const prefix = "[some-prefix]";
    const logger = createLogger({ hub, prefix });
    logger.warn("Hey!");

    expect(consoleLogSpy).toHaveBeenCalledWith("[some-prefix] Warning! Hey!");
    expect(mockedAddBreadcrumb).toHaveBeenCalledWith({
      category: "logger",
      level: "warning",
      message: "Hey!",
    });
  });

  it(".error() should log correctly", () => {
    const prefix = "[some-prefix]";
    const logger = createLogger({ hub, prefix });
    logger.error("Hey!");

    expect(consoleLogSpy).toHaveBeenCalledWith("[some-prefix] Error: Hey!");
    expect(mockedAddBreadcrumb).toHaveBeenCalledWith({
      category: "logger",
      level: "error",
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
