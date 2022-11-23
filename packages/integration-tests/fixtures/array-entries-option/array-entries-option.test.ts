import childProcess from "child_process";
import path from "path";
import fs from "fs";
import { testIfNodeMajorVersionIsLessThan18 } from "../../utils/testIf";

function getBundleOutput(bundlePath: string): string {
  return childProcess.execSync(`node ${bundlePath}`, { encoding: "utf-8" });
}

function getFileContents(bundlePath: string): string {
  return fs.readFileSync(bundlePath, { encoding: "utf-8" });
}

describe("`releaseInjectionTargets` option should work as expected when given an array of RegEx and strings", () => {
  test("esbuild bundle", () => {
    expect(getBundleOutput(path.join(__dirname, "out", "esbuild", "entrypoint1.js"))).toBe(
      "I AM A RELEASE!"
    );
    expect(getBundleOutput(path.join(__dirname, "out", "esbuild", "entrypoint2.js"))).toBe("");
    expect(getBundleOutput(path.join(__dirname, "out", "esbuild", "entrypoint3.js"))).toBe(
      "I AM A RELEASE!"
    );
    expect(getFileContents(path.join(__dirname, "out", "esbuild", "entrypoint2.js"))).not.toContain(
      "I AM A RELEASE!"
    );
  });

  test("rollup bundle", () => {
    expect(getBundleOutput(path.join(__dirname, "out", "rollup", "entrypoint1.js"))).toBe(
      "I AM A RELEASE!"
    );
    expect(getBundleOutput(path.join(__dirname, "out", "rollup", "entrypoint2.js"))).toBe("");
    expect(getBundleOutput(path.join(__dirname, "out", "rollup", "entrypoint3.js"))).toBe(
      "I AM A RELEASE!"
    );
    expect(getFileContents(path.join(__dirname, "out", "rollup", "entrypoint2.js"))).not.toContain(
      "I AM A RELEASE!"
    );
  });

  test("vite bundle", () => {
    expect(getBundleOutput(path.join(__dirname, "out", "vite", "entrypoint1.js"))).toBe(
      "I AM A RELEASE!"
    );
    expect(getBundleOutput(path.join(__dirname, "out", "vite", "entrypoint2.js"))).toBe("");
    expect(getBundleOutput(path.join(__dirname, "out", "vite", "entrypoint3.js"))).toBe(
      "I AM A RELEASE!"
    );
    expect(getFileContents(path.join(__dirname, "out", "vite", "entrypoint2.js"))).not.toContain(
      "I AM A RELEASE!"
    );
  });

  testIfNodeMajorVersionIsLessThan18("webpack 4 bundle", () => {
    // eslint-disable-next-line jest/no-standalone-expect
    expect(getBundleOutput(path.join(__dirname, "out", "webpack4", "entrypoint1.js"))).toBe(
      "I AM A RELEASE!"
    );
    // eslint-disable-next-line jest/no-standalone-expect
    expect(getBundleOutput(path.join(__dirname, "out", "webpack4", "entrypoint2.js"))).toBe("");
    // eslint-disable-next-line jest/no-standalone-expect
    expect(getBundleOutput(path.join(__dirname, "out", "webpack4", "entrypoint3.js"))).toBe(
      "I AM A RELEASE!"
    );
    // eslint-disable-next-line jest/no-standalone-expect
    expect(
      getFileContents(path.join(__dirname, "out", "webpack4", "entrypoint2.js"))
    ).not.toContain("I AM A RELEASE!");
  });

  test("webpack 5 bundle", () => {
    expect(getBundleOutput(path.join(__dirname, "out", "webpack5", "entrypoint1.js"))).toBe(
      "I AM A RELEASE!"
    );
    expect(getBundleOutput(path.join(__dirname, "out", "webpack5", "entrypoint2.js"))).toBe("");
    expect(getBundleOutput(path.join(__dirname, "out", "webpack5", "entrypoint3.js"))).toBe(
      "I AM A RELEASE!"
    );
    expect(
      getFileContents(path.join(__dirname, "out", "webpack5", "entrypoint2.js"))
    ).not.toContain("I AM A RELEASE!");
  });
});
