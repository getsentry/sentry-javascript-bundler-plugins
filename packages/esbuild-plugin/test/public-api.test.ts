import { sentryEsbuildPlugin } from "../src";

test("Esbuild plugin should exist", () => {
  expect(sentryEsbuildPlugin).toBeDefined();
  expect(typeof sentryEsbuildPlugin).toBe("function");
});
