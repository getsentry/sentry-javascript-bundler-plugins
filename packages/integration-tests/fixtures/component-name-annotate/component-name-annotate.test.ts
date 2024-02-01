import childProcess from "child_process";
import path from "path";
import { testIfNodeMajorVersionIsLessThan18 } from "../../utils/testIf";

// prettier-ignore
const SNAPSHOT = `"<div><span data-sentry-component=\\"ComponentA\\" data-sentry-source-file=\\"component-a.jsx\\">Component A</span></div>"`
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

testIfNodeMajorVersionIsLessThan18("webpack 4 bundle if node is < 18", () => {
  expect.assertions(1);
  checkBundle(path.join(__dirname, "./out/webpack4/index.js"));
});

test("webpack 5 bundle", () => {
  expect.assertions(1);
  checkBundle(path.join(__dirname, "./out/webpack5/index.js"));
});
