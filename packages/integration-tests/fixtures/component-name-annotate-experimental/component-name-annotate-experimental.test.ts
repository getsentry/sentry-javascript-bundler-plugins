import childProcess from "child_process";
import path from "path";

const SNAPSHOT = `"<div><span data-sentry-component=\\"ComponentA\\">Component A</span></div>"`;
const ESBUILD_SNAPSHOT = `"<div><span>Component A</span></div>"`;

function checkBundle(bundlePath: string, snapshot = SNAPSHOT): void {
  const processOutput = childProcess.execSync(`node ${bundlePath}`, { encoding: "utf-8" });
  expect(processOutput.trim()).toMatchInlineSnapshot(snapshot);
}

test("esbuild bundle", () => {
  expect.assertions(1);
  checkBundle(path.join(__dirname, "./out/esbuild/index.js"), ESBUILD_SNAPSHOT);
});

test("rollup bundle", () => {
  expect.assertions(1);
  checkBundle(path.join(__dirname, "./out/rollup/index.js"));
});

test("vite bundle", () => {
  expect.assertions(1);
  checkBundle(path.join(__dirname, "./out/vite/index.js"));
});

test("webpack 5 bundle", () => {
  expect.assertions(1);
  checkBundle(path.join(__dirname, "./out/webpack/index.js"));
});
