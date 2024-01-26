import childProcess from "child_process";
import path from "path";
import { testIfNodeMajorVersionIsLessThan18 } from "../../utils/testIf";

function checkBundle(bundlePath: string): void {
  const processOutput = childProcess.execSync(`node ${bundlePath}`, { encoding: "utf-8" });
  expect(processOutput).toMatchSnapshot();
}

test("esbuild bundle", () => {
  expect.assertions(1);
  checkBundle(path.join(__dirname, "./out/esbuild/index.js"));
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
