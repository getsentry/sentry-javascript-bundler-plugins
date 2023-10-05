import childProcess from "child_process";
import path from "path";
import fs from "fs";

const outputBundlePath = path.join(__dirname, "out", "index.js");

test("check functionality", () => {
  const processOutput = childProcess.execSync(`node ${outputBundlePath}`, { encoding: "utf-8" });
  expect(processOutput).toMatch(/some-injected-value/);
});

test("check that output only contains one debug ID reference", async () => {
  const bundleContent = await fs.promises.readFile(outputBundlePath, "utf-8");
  const debugIdReferences = bundleContent.match(/sentry-dbid-/g) ?? [];
  expect(debugIdReferences).toHaveLength(1);
});
