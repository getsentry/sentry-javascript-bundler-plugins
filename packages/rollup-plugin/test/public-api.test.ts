import { sentryRollupPlugin } from "../src";

test("Rollup plugin should exist", () => {
  expect(sentryRollupPlugin).toBeDefined();
  expect(typeof sentryRollupPlugin).toBe("function");
});

describe("sentryRollupPlugin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns a single rollup plugin", () => {
    const plugin = sentryRollupPlugin({
      authToken: "test-token",
      org: "test-org",
      project: "test-project",
    });

    expect(Array.isArray(plugin)).not.toBe(true);

    expect(plugin.name).toBe("sentry-rollup-plugin");
  });
});
