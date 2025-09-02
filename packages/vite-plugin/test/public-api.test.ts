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
    });

    expect(Array.isArray(plugins)).toBe(true);

    const pluginNames = plugins.map((plugin) => plugin.name);

    expect(pluginNames).toEqual(
      expect.arrayContaining([
        "sentry-telemetry-plugin",
        "sentry-vite-release-injection-plugin",
        "sentry-release-management-plugin",
        "sentry-vite-debug-id-injection-plugin",
        "sentry-vite-debug-id-upload-plugin",
        "sentry-file-deletion-plugin",
      ])
    );
  });
});
