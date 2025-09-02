import { Plugin } from "webpack";
import { sentryWebpackPlugin } from "../src/webpack5";

jest.mock("webpack", () => {
  throw new Error("Webpack 5 version of the plugin should use module from compiler.");
});

test("Webpack plugin should exist", () => {
  expect(sentryWebpackPlugin).toBeDefined();
  expect(typeof sentryWebpackPlugin).toBe("function");
});

describe("sentryWebpackPlugin", () => {
  it("returns a webpack plugin", () => {
    const plugin = sentryWebpackPlugin({
      authToken: "test-token",
      org: "test-org",
      project: "test-project",
    }) as Plugin;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    expect(plugin).toEqual({ apply: expect.any(Function) });
  });
});
