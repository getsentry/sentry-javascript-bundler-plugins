/* eslint-disable jest/no-standalone-expect */
/* eslint-disable jest/expect-expect */
import path from "path";
import fs from "fs";

describe("Deletes files with `filesToDeleteAfterUpload` set to a promise", () => {
  test("webpack 5 bundle", () => {
    expect(fs.existsSync(path.join(__dirname, "out", "webpack", "bundle.js.map"))).toBe(false);
  });

  test("esbuild bundle", () => {
    expect(fs.existsSync(path.join(__dirname, "out", "esbuild", "bundle.js.map"))).toBe(false);
  });

  test("rollup bundle", () => {
    expect(fs.existsSync(path.join(__dirname, "out", "rollup", "bundle.js.map"))).toBe(false);
  });

  test("vite bundle", () => {
    expect(fs.existsSync(path.join(__dirname, "out", "vite", "bundle.js.map"))).toBe(false);
  });
});
