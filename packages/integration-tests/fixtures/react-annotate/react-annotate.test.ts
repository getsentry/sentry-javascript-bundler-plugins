import childProcess from "child_process";
import path from "path";

function checkBundle(bundlePath: string): void {
  const processOutput = childProcess.execSync(`node ${bundlePath}`, { encoding: "utf-8" });
  expect(processOutput).toMatchSnapshot();
}

test.todo("esbuild bundle");

test("rollup bundle", () => {
  expect.assertions(1);
  checkBundle(path.join(__dirname, "./out/vite/index.js"));
});

test("vite bundle", () => {
  expect.assertions(1);
  checkBundle(path.join(__dirname, "./out/vite/index.js"));
});

test.todo("webpack 4 bundle if node is < 18");

test.todo("webpack 5 bundle");
