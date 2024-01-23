import childProcess from "child_process";
import path from "path";

/**
 * Runs a node file in a seprate process.
 *
 * @param bundlePath Path of node file to run
 * @returns Stdout of the process
 */
function checkBundle(bundlePath: string): void {
  const processOutput = childProcess.execSync(`node ${bundlePath}`, { encoding: "utf-8" });
  expect(processOutput).toBe("<div>");
}

test.todo("esbuild bundle");

test.todo("rollup bundle");

test("vite bundle", () => {
  expect.assertions(1);
  checkBundle(path.join(__dirname, "./out/vite/index.js"));
});

test.todo("webpack 4 bundle if node is < 18");

test.todo("webpack 5 bundle");
