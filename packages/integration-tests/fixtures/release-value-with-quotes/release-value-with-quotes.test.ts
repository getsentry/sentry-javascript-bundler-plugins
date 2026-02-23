/* eslint-disable jest/no-standalone-expect */
/* eslint-disable jest/expect-expect */
import { execSync } from "child_process";
import path from "path";

function checkBundle(bundlePath: string): void {
  const output = execSync(`node ${bundlePath}`, { encoding: "utf-8" });
  expect(output.trimEnd()).toBe('"i am a dangerous release value because I contain a \\""');
}

describe("Properly escapes release values before injecting", () => {
  test("webpack bundle", () => {
    checkBundle(path.join(__dirname, "out", "webpack", "bundle.js"));
  });

  test("esbuild bundle", () => {
    checkBundle(path.join(__dirname, "out", "esbuild", "bundle.js"));
  });

  test("rollup bundle", () => {
    checkBundle(path.join(__dirname, "out", "rollup", "bundle.js"));
  });

  test("vite bundle", () => {
    checkBundle(path.join(__dirname, "out", "vite", "bundle.js"));
  });
});
