import fs from "fs";
import path from "path";

function checkBundle(bundlePath: string): void {
  const output = fs.readFileSync(bundlePath, "utf-8");

  expect(output).toMatch('"data-sentry-component":"App"');
  expect(output).toMatch('"data-sentry-source-file":"app.jsx"');

  expect(output).toMatch('"data-sentry-component":"ComponentA"');
  expect(output).toMatch('"data-sentry-source-file":"component-a.jsx"');
}

test.todo("esbuild bundle");

test.todo("rollup bundle");

test("vite bundle", () => {
  expect.assertions(4);
  checkBundle(path.join(__dirname, "./out/vite/index.js"));
});

test.todo("webpack 4 bundle if node is < 18");

test.todo("webpack 5 bundle");
