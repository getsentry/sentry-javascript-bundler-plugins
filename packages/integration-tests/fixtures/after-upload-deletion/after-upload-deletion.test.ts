import path from "path";
import fs from "fs";
import { describe, test, expect } from "vitest";

describe("Deletes with `filesToDeleteAfterUpload` even without uploading anything", () => {
  test("webpack bundle", () => {
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
