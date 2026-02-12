import { EsbuildPlugin } from "unplugin";
import { sentryEsbuildPlugin } from "../src";

test("Esbuild plugin should exist", () => {
  expect(sentryEsbuildPlugin).toBeDefined();
  expect(typeof sentryEsbuildPlugin).toBe("function");
});

describe("sentryEsbuildPlugin", () => {
  it("returns an esbuild plugin", () => {
    const plugins = sentryEsbuildPlugin({
      authToken: "test-token",
      org: "test-org",
      project: "test-project",
    }) as EsbuildPlugin;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    expect(plugins).toEqual({ name: "sentry-esbuild-plugin", setup: expect.any(Function) });
  });
});
