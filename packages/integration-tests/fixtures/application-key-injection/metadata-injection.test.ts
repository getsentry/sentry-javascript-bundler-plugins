import { execSync } from "child_process";
import path from "path";
import { describe, test, expect } from "vitest";

function checkBundle(bundlePath: string): void {
  const output = execSync(`node ${bundlePath}`, { encoding: "utf-8" });

  const map = JSON.parse(output) as Record<string, string>;

  // There should be only one key in the map
  expect(Object.values(map)).toHaveLength(1);
  // The value should be the expected metadata
  expect(Object.values(map)).toEqual([{ ["_sentryBundlerPluginAppKey:my-app"]: true }]);
}

describe("appKey injection", () => {
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
