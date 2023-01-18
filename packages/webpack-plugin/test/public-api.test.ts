import { sentryWebpackPlugin } from "../src";

test("Webpack plugin should exist", () => {
  expect(sentryWebpackPlugin).toBeDefined();
  expect(typeof sentryWebpackPlugin).toBe("function");
});
