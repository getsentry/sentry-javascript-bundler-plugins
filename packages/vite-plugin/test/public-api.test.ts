import { sentryVitePlugin } from "../src";

test("Vite plugin should exist", () => {
  expect(sentryVitePlugin).toBeDefined();
  expect(typeof sentryVitePlugin).toBe("function");
});
