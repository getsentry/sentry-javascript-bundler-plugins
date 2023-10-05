import childProcess from "child_process";
import path from "path";

const outputBundlePath = path.join(__dirname, "out", "index.js");

test("check functionality", () => {
  const processOutput = childProcess.execSync(`node ${outputBundlePath}`, { encoding: "utf-8" });
  expect(processOutput).toMatch(/some-injected-value/);
});
