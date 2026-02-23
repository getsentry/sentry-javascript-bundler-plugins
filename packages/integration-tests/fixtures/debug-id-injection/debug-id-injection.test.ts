/* eslint-disable jest/no-standalone-expect */
/* eslint-disable jest/expect-expect */
import childProcess from "child_process";
import path from "path";
import { testIfNodeMajorVersionIsLessThan18 } from "../../utils/testIf";

function checkBundle(bundlePath1: string, bundlePath2: string): string[] {
  const process1Output = childProcess.execSync(`node ${bundlePath1}`, { encoding: "utf-8" });
  const debugIdMap1 = JSON.parse(process1Output) as Record<string, string>;
  const debugIds1 = Object.values(debugIdMap1);
  expect(debugIds1.length).toBeGreaterThan(0);
  expect(debugIds1).toContainEqual(
    expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  );

  expect(Object.keys(debugIdMap1)[0]).toContain("Error");

  const process2Output = childProcess.execSync(`node ${bundlePath2}`, { encoding: "utf-8" });
  const debugIdMap2 = JSON.parse(process2Output) as Record<string, string>;
  const debugIds2 = Object.values(debugIdMap2);
  expect(debugIds2.length).toBeGreaterThan(0);
  expect(debugIds2).toContainEqual(
    expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  );

  expect(Object.keys(debugIdMap2)[0]).toContain("Error");

  expect(debugIds1).not.toEqual(debugIds2);

  return [...debugIds1, ...debugIds2];
}

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
