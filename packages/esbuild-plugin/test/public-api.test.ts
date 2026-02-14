import { sentryEsbuildPlugin } from "../src";
import { Plugin } from "esbuild";

test("Esbuild plugin should exist", () => {
  expect(sentryEsbuildPlugin).toBeDefined();
  expect(typeof sentryEsbuildPlugin).toBe("function");
});

describe("sentryEsbuildPlugin", () => {
  it("returns an esbuild plugin", () => {
    const plugin = sentryEsbuildPlugin({
      authToken: "test-token",
      org: "test-org",
      project: "test-project",
    }) as Plugin;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    expect(plugin).toEqual({ name: "sentry-esbuild-plugin", setup: expect.any(Function) });
  });
});
