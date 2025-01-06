/* eslint-disable jest/no-standalone-expect */
/* eslint-disable jest/expect-expect */
import childProcess from "child_process";
import path from "path";
import { testIfNodeMajorVersionIsLessThan18 } from "../../utils/testIf";

function checkBundle(bundlePath1: string, bundlePath2: string) {
  const process1Output = childProcess.execSync(`node ${bundlePath1}`, { encoding: "utf-8" });
  expect(process1Output).toBe("undefined\n");

  const process2Output = childProcess.execSync(`node ${bundlePath2}`, { encoding: "utf-8" });
  expect(process2Output).toBe("undefined\n");
}

describe("should not inject debug IDs when `sourcemaps.disable` is `true`", () => {
  test("esbuild bundle", () => {
    checkBundle(
      path.join(__dirname, "out", "esbuild", "bundle1.js"),
      path.join(__dirname, "out", "esbuild", "bundle2.js")
    );
  });

  test("rollup bundle", () => {
    checkBundle(
      path.join(__dirname, "out", "rollup", "bundle1.js"),
      path.join(__dirname, "out", "rollup", "bundle2.js")
    );
  });

  test("vite bundle", () => {
    checkBundle(
      path.join(__dirname, "out", "vite", "bundle1.js"),
      path.join(__dirname, "out", "vite", "bundle2.js")
    );
  });

  testIfNodeMajorVersionIsLessThan18("webpack 4 bundle", () => {
    checkBundle(
      path.join(__dirname, "out", "webpack4", "bundle1.js"),
      path.join(__dirname, "out", "webpack4", "bundle2.js")
    );
  });

  test("webpack 5 bundle", () => {
    checkBundle(
      path.join(__dirname, "out", "webpack5", "bundle1.js"),
      path.join(__dirname, "out", "webpack5", "bundle2.js")
    );
  });
});
