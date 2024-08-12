/* eslint-disable jest/no-standalone-expect */
/* eslint-disable jest/expect-expect */
import { execSync } from "child_process";
import path from "path";
import { testIfNodeMajorVersionIsLessThan18 } from "../../utils/testIf";

function checkBundle(bundlePath: string): void {
  const output = execSync(`node ${bundlePath}`, { encoding: "utf-8" });
  expect(output.trimEnd()).toBe('"i am a dangerous release value because I contain a \\""');
}

describe("Properly escapes release values before injecting", () => {
  testIfNodeMajorVersionIsLessThan18("webpack 4 bundle", () => {
    checkBundle(path.join(__dirname, "out", "webpack4", "bundle.js"));
  });

  test("webpack 5 bundle", () => {
    checkBundle(path.join(__dirname, "out", "webpack5", "bundle.js"));
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
