import { VitePlugin } from "unplugin";
import { sentryVitePlugin } from "../src";

test("Vite plugin should exist", () => {
  expect(sentryVitePlugin).toBeDefined();
  expect(typeof sentryVitePlugin).toBe("function");
});

describe("sentryVitePlugin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns an array of Vite plugins", () => {
    const plugins = sentryVitePlugin({
      authToken: "test-token",
      org: "test-org",
      project: "test-project",
    }) as VitePlugin[];

    expect(Array.isArray(plugins)).toBe(true);

    const pluginNames = plugins.map((plugin) => plugin.name);

    expect(pluginNames).toEqual([
      "sentry-telemetry-plugin",
      "sentry-vite-release-injection-plugin",
      "sentry-release-management-plugin",
      "sentry-vite-debug-id-injection-plugin",
      "sentry-vite-debug-id-upload-plugin",
      "sentry-file-deletion-plugin",
    ]);
  });

  it("doesn't include release management and debug id upload plugins if NODE_ENV is 'development'", () => {
    const originalNodeEnv = process.env["NODE_ENV"];
    process.env["NODE_ENV"] = "development";

    const consoleSpy = jest.spyOn(console, "debug").mockImplementation(() => {
      /* avoid test output pollution */
    });

    const plugins = sentryVitePlugin({
      authToken: "test-token",
      org: "test-org",
      project: "test-project",
      debug: true,
    }) as VitePlugin[];

    expect(Array.isArray(plugins)).toBe(true);

    const pluginNames = plugins.map((plugin) => plugin.name);

    expect(pluginNames).toEqual([
      "sentry-telemetry-plugin",
      "sentry-vite-release-injection-plugin",
      "sentry-vite-debug-id-injection-plugin",
      "sentry-file-deletion-plugin",
    ]);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Running in development mode. Will not create release.")
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Running in development mode. Will not upload sourcemaps.")
    );

    process.env["NODE_ENV"] = originalNodeEnv;
  });
});
