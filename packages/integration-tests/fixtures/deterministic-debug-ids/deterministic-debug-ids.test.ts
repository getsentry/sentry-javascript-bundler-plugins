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

beforeEach(async () => {
  await fs.writeFile(
    path.join(__dirname, "input", "dynamic-variable.js"),
    `global.dynamicVariable = 1;`
  );
});

afterEach(async () => {
  await fs.unlink(path.join(__dirname, "input", "dynamic-variable.js"));
});

describe("Same debug IDs for multiple identical builds", () => {
  const bundlers = ["rollup", "vite", "webpack5"];

  if (parseInt(nodejsMajorversion) < 18) {
    bundlers.push("webpack4");
  }

  test.each(bundlers)(
    "%s",
    (bundler) => {
      // build
      childProcess.execSync(`yarn ts-node ${path.join(__dirname, `build-${bundler}.ts`)}`);

      const debugIds1 = executeAndGetDebugIds(path.join(__dirname, "out", bundler, "index.js"));

      // rebuild
      childProcess.execSync(`yarn ts-node ${path.join(__dirname, `build-${bundler}.ts`)}`);

      const debugIds2 = executeAndGetDebugIds(path.join(__dirname, "out", bundler, "index.js"));

      expect(debugIds1).toStrictEqual(debugIds2);
    },
    20_000
  );
});

describe("Different debug IDs for different builds", () => {
  const bundlers = ["rollup", "vite", "webpack5"];

  if (parseInt(nodejsMajorversion) < 18) {
    bundlers.push("webpack4");
  }

  test.each(bundlers)(
    "%s",
    async (bundler) => {
      // build
      childProcess.execSync(`yarn ts-node ${path.join(__dirname, `build-${bundler}.ts`)}`);

      const debugIds1 = executeAndGetDebugIds(path.join(__dirname, "out", bundler, "index.js"));

      await fs.writeFile(
        path.join(__dirname, "input", "dynamic-variable.js"),
        `global.dynamicVariable = 2;`
      );

      // rebuild
      childProcess.execSync(`yarn ts-node ${path.join(__dirname, `build-${bundler}.ts`)}`);

      const debugIds2 = executeAndGetDebugIds(path.join(__dirname, "out", bundler, "index.js"));

      expect(debugIds1).not.toEqual(debugIds2);
    },
    20_000
  );
});
