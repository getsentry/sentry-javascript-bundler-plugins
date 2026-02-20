/* eslint-disable jest/no-standalone-expect */
/* eslint-disable jest/expect-expect */
import { execSync } from "child_process";
import path from "path";

function checkBundle(bundlePath: string): void {
  const output = execSync(`node ${bundlePath}`, { encoding: "utf-8" });

  const map = JSON.parse(output) as Record<string, string>;

  // There should be only one key in the map
  expect(Object.values(map)).toHaveLength(1);
  // The value should be the expected metadata
  expect(Object.values(map)).toEqual([{ team: "frontend" }]);

  // The key is the stack trace of the error thrown in the file
  expect(Object.keys(map)[0]).toContain("Error");
  expect(Object.keys(map)[0]).toContain("bundle.js");
}

describe("metadata injection", () => {
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
