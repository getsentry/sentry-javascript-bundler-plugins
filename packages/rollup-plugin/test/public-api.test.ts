import { Plugin } from "rollup";
import { sentryRollupPlugin } from "../src";

test("Rollup plugin should exist", () => {
  expect(sentryRollupPlugin).toBeDefined();
  expect(typeof sentryRollupPlugin).toBe("function");
});

describe("sentryRollupPlugin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns an array of rollup plugins", () => {
    const plugins = sentryRollupPlugin({
      authToken: "test-token",
      org: "test-org",
      project: "test-project",
    }) as Plugin[];

    expect(Array.isArray(plugins)).toBe(true);

    const pluginNames = plugins.map((plugin) => plugin.name);

    expect(pluginNames).toEqual(
      expect.arrayContaining([
        "sentry-telemetry-plugin",
        "sentry-release-management-plugin",
        "sentry-rollup-injection-plugin",
        "sentry-rollup-debug-id-upload-plugin",
        "sentry-file-deletion-plugin",
      ])
    );
  });
});
