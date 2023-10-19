/* eslint-disable jest/no-standalone-expect */
/* eslint-disable jest/expect-expect */
import path from "path";
import fs from "fs";
import { testIfNodeMajorVersionIsLessThan18 } from "../../utils/testIf";

function checkBundle(bundler: string, bundlePath: string): void {
  const actualPath = path.join(__dirname, "out", bundler, bundlePath);
  const expectedPath = path.join(__dirname, "expected", bundler, bundlePath);

  const actual = fs.readFileSync(actualPath, "utf-8");
  const expected = fs.readFileSync(expectedPath, "utf-8");

  expect(actual).toContain(expected);
}

test("esbuild bundle", () => {
  checkBundle("esbuild", "bundle1.js");
  checkBundle("esbuild", "bundle2.js");
});

test("rollup bundle", () => {
  checkBundle("rollup", "bundle1.js");
  checkBundle("rollup", "bundle2.js");
});

test("vite bundle", () => {
  checkBundle("vite", "bundle1.js");
  checkBundle("vite", "bundle2.js");
});

testIfNodeMajorVersionIsLessThan18("webpack 4 bundle", () => {
  checkBundle("webpack4", "bundle1.js");
  checkBundle("webpack4", "bundle2.js");
});

test("webpack 5 bundle", () => {
  checkBundle("webpack5", "bundle1.js");
  checkBundle("webpack5", "bundle2.js");
});
