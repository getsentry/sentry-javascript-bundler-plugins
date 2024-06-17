/* eslint-disable jest/no-standalone-expect */
/* eslint-disable jest/expect-expect */
import path from "path";
import fs from "fs";
import { testIfNodeMajorVersionIsLessThan18 } from "../../utils/testIf";

describe("Deletes with `filesToDeleteAfterUpload` even without uploading anything", () => {
  testIfNodeMajorVersionIsLessThan18("webpack 4 bundle", () => {
    expect(fs.existsSync(path.join(__dirname, "out", "webpack4", "bundle.js.map"))).toBe(false);
  });

  test("webpack 5 bundle", () => {
    expect(fs.existsSync(path.join(__dirname, "out", "webpack5", "bundle.js.map"))).toBe(false);
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
