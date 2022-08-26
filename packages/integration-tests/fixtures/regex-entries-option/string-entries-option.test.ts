import childProcess from "child_process";
import path from "path";
import fs from "fs";

function getBundleOutput(bundlePath: string): string {
  return childProcess.execSync(`node ${bundlePath}`, { encoding: "utf-8" });
}

function getFileContents(bundlePath: string): string {
  return fs.readFileSync(bundlePath, { encoding: "utf-8" });
}

describe("`entries` option should work as expected when given a regular expression", () => {
  test("esbuild bundle", () => {
    expect(getBundleOutput(path.join(__dirname, "./out/esbuild/entrypoint1.js"))).toBe(
      "I AM A RELEASE!"
    );
    expect(getBundleOutput(path.join(__dirname, "./out/esbuild/entrypoint2.js"))).toBe("");
    expect(getFileContents(path.join(__dirname, "./out/esbuild/entrypoint2.js"))).not.toContain(
      "I AM A RELEASE!"
    );
  });

  test("rollup bundle", () => {
    expect(getBundleOutput(path.join(__dirname, "./out/rollup/entrypoint1.js"))).toBe(
      "I AM A RELEASE!"
    );
    expect(getBundleOutput(path.join(__dirname, "./out/rollup/entrypoint2.js"))).toBe("");
    expect(getFileContents(path.join(__dirname, "./out/rollup/entrypoint2.js"))).not.toContain(
      "I AM A RELEASE!"
    );
  });

  test("vite bundle", () => {
    expect(getBundleOutput(path.join(__dirname, "./out/vite/entrypoint1.js"))).toBe(
      "I AM A RELEASE!"
    );
    expect(getBundleOutput(path.join(__dirname, "./out/vite/entrypoint2.js"))).toBe("");
    expect(getFileContents(path.join(__dirname, "./out/vite/entrypoint2.js"))).not.toContain(
      "I AM A RELEASE!"
    );
  });

  test("webpack 4 bundle", () => {
    expect(getBundleOutput(path.join(__dirname, "./out/webpack4/entrypoint1.js"))).toBe(
      "I AM A RELEASE!"
    );
    expect(getBundleOutput(path.join(__dirname, "./out/webpack4/entrypoint2.js"))).toBe("");
    expect(getFileContents(path.join(__dirname, "./out/webpack4/entrypoint2.js"))).not.toContain(
      "I AM A RELEASE!"
    );
  });

  test("webpack 5 bundle", () => {
    expect(getBundleOutput(path.join(__dirname, "./out/webpack5/entrypoint1.js"))).toBe(
      "I AM A RELEASE!"
    );
    expect(getBundleOutput(path.join(__dirname, "./out/webpack5/entrypoint2.js"))).toBe("");
    expect(getFileContents(path.join(__dirname, "./out/webpack5/entrypoint2.js"))).not.toContain(
      "I AM A RELEASE!"
    );
  });
});
