// import {makeSentryClient} from "../src/sentry/telemetry"
import { Hub } from "@sentry/node";
import sentryLogger from "../src/sentry/logger";

describe("Logger", () => {
  const info = jest.spyOn(console, "info").mockImplementation(() => {
    return;
  });
  const warn = jest.spyOn(console, "warn").mockImplementation(() => {
    return;
  });
  const error = jest.spyOn(console, "error").mockImplementation(() => {
    return;
  });

  const spy = { info, warn, error };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const hub: Hub = {
    addBreadcrumb: () => {
      return;
    },
  };

  const mockedAddBreadcrumb = jest.spyOn(hub, "addBreadcrumb");

  afterEach(() => {
    info.mockReset();
    warn.mockReset();
    error.mockReset();
    mockedAddBreadcrumb.mockReset();
  });

  const CASES = ["info", "warn", "error"];

  it.each(CASES)("logs (%s)", (a: string) => {
    const logger = sentryLogger({ options: { silent: false }, hub });
    // "info" -> make typescript happy
    logger[a as "info"]("Hey!");

    expect(spy[a as "info"]).toHaveBeenCalledWith(logger.prefix, "Hey!");
    expect(mockedAddBreadcrumb).toHaveBeenCalledWith({
      category: "logger",
      level: a === "warn" ? "warning" : a,
      message: "Hey!",
    });
  });

  it.each(CASES)("does not log (%s)", (a: string) => {
    const logger = sentryLogger({ options: { silent: true }, hub });
    // "info" -> make typescript happy
    logger[a as "info"]("Hey!");

    expect(spy[a as "info"]).not.toHaveBeenCalledWith(logger.prefix, "Hey!");
    expect(mockedAddBreadcrumb).toHaveBeenCalledWith({
      category: "logger",
      level: a === "warn" ? "warning" : a,
      message: "Hey!",
    });
  });
});
