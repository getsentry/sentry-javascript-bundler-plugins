/* eslint-disable jest/no-standalone-expect */
/* eslint-disable jest/expect-expect */
import childProcess from "child_process";
import path from "path";
import fs from "fs/promises";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const nodejsMajorversion = process.version.split(".")[0]!.slice(1);

function executeAndGetDebugIds(bundlePath: string): string[] {
  const processOutput = childProcess.execSync(`node ${bundlePath}`, { encoding: "utf-8" });
  const debugIdMap = JSON.parse(processOutput) as Record<string, string>;
  return Object.values(debugIdMap);
}

function build(): void {
  childProcess.execSync(`yarn ts-node ${path.join(__dirname, "build.ts")}`, { stdio: "inherit" });
}

beforeAll(async () => {
  await fs.writeFile(
    path.join(__dirname, "input", "dynamic-variable.js"),
    `global.dynamicVariable = 1;`
  );
});

afterAll(async () => {
  await fs.unlink(path.join(__dirname, "input", "dynamic-variable.js"));
});

test("Same debug IDs for multiple identical builds", () => {
  build();

  const rollupDebugIds1 = executeAndGetDebugIds(path.join(__dirname, "out", "rollup", "index.js"));
  const viteDebugIds1 = executeAndGetDebugIds(path.join(__dirname, "out", "vite", "index.js"));
  const webpack5DebugIds1 = executeAndGetDebugIds(
    path.join(__dirname, "out", "webpack5", "index.js")
  );

  let webpack4DebugIds1;
  if (parseInt(nodejsMajorversion) < 18) {
    webpack4DebugIds1 = executeAndGetDebugIds(path.join(__dirname, "out", "webpack4", "index.js"));
  }

  // rebuild
  build();

  const rollupDebugIds2 = executeAndGetDebugIds(path.join(__dirname, "out", "rollup", "index.js"));
  const viteDebugIds2 = executeAndGetDebugIds(path.join(__dirname, "out", "vite", "index.js"));
  const webpack5DebugIds2 = executeAndGetDebugIds(
    path.join(__dirname, "out", "webpack5", "index.js")
  );

  let webpack4DebugIds2;
  if (parseInt(nodejsMajorversion) < 18) {
    webpack4DebugIds2 = executeAndGetDebugIds(path.join(__dirname, "out", "webpack4", "index.js"));
  }

  expect(rollupDebugIds1).toStrictEqual(rollupDebugIds2);
  expect(viteDebugIds1).toStrictEqual(viteDebugIds2);
  expect(webpack5DebugIds1).toStrictEqual(webpack5DebugIds2);

  if (parseInt(nodejsMajorversion) < 18) {
    // eslint-disable-next-line jest/no-conditional-expect
    expect(webpack4DebugIds1).toStrictEqual(webpack4DebugIds2);
  }
}, 20000); // we need increased timeout because builds take a while

test("Different debug IDs for different builds", async () => {
  build();

  const rollupDebugIds1 = executeAndGetDebugIds(path.join(__dirname, "out", "rollup", "index.js"));
  const viteDebugIds1 = executeAndGetDebugIds(path.join(__dirname, "out", "vite", "index.js"));
  const webpack5DebugIds1 = executeAndGetDebugIds(
    path.join(__dirname, "out", "webpack5", "index.js")
  );

  let webpack4DebugIds1;
  if (parseInt(nodejsMajorversion) < 18) {
    webpack4DebugIds1 = executeAndGetDebugIds(path.join(__dirname, "out", "webpack4", "index.js"));
  }

  await fs.writeFile(
    path.join(__dirname, "input", "dynamic-variable.js"),
    `global.dynamicVariable = 2;`
  );

  // rebuild
  build();

  const rollupDebugIds2 = executeAndGetDebugIds(path.join(__dirname, "out", "rollup", "index.js"));
  const viteDebugIds2 = executeAndGetDebugIds(path.join(__dirname, "out", "vite", "index.js"));
  const webpack5DebugIds2 = executeAndGetDebugIds(
    path.join(__dirname, "out", "webpack5", "index.js")
  );

  let webpack4DebugIds2;
  if (parseInt(nodejsMajorversion) < 18) {
    webpack4DebugIds2 = executeAndGetDebugIds(path.join(__dirname, "out", "webpack4", "index.js"));
  }

  expect(rollupDebugIds1).not.toEqual(rollupDebugIds2);
  expect(viteDebugIds1).not.toEqual(viteDebugIds2);
  expect(webpack5DebugIds1).not.toEqual(webpack5DebugIds2);

  if (parseInt(nodejsMajorversion) < 18) {
    // eslint-disable-next-line jest/no-conditional-expect
    expect(webpack4DebugIds1).not.toEqual(webpack4DebugIds2);
  }
}, 20000); // we need increased timeout because builds take a while
