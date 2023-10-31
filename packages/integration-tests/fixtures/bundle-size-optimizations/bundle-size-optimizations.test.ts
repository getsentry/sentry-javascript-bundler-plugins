/* eslint-disable jest/no-standalone-expect */
/* eslint-disable jest/expect-expect */
import path from "path";
import fs from "fs";
import { testIfNodeMajorVersionIsLessThan18 } from "../../utils/testIf";

const expectedOutputs: Record<string, Record<string, string>> = {
  esbuild: {
    "bundle1.js": `console.log(1)`,
    "bundle2.js": `console.log({debug:"b",trace:"b",replayCanvas:"a",replayIframe:"a",replayShadowDom:"a",replayWorker:"a"})`,
  },
  rollup: {
    "bundle1.js": `console.log(1 );`,
    "bundle2.js": `console.log({
  debug: "b",
  trace: "b",
  replayCanvas: "a" ,
  replayIframe: "a" ,
  replayShadowDom: "a" ,
  replayWorker: "a" ,
});`,
  },
  vite: {
    "bundle1.js": `console.log(1);`,
    "bundle2.js": `console.log({debug:"b",trace:"b",replayCanvas:"a",replayIframe:"a",replayShadowDom:"a",replayWorker:"a"})`,
  },
  webpack4: {
    "bundle1.js": `console.log(1)`,
    "bundle2.js": `console.log({debug:"b",trace:"b",replayCanvas:"a",replayIframe:"a",replayShadowDom:"a",replayWorker:"a"})`,
  },
  webpack5: {
    "bundle1.js": `console.log(1)`,
    "bundle2.js": `console.log({debug:"b",trace:"b",replayCanvas:"a",replayIframe:"a",replayShadowDom:"a",replayWorker:"a"})`,
  },
};

function checkBundle(bundler: string, bundlePath: string): void {
  const actualPath = path.join(__dirname, "out", bundler, bundlePath);

  // We replace multiple whitespaces with a single space for consistency
  const actual = fs.readFileSync(actualPath, "utf-8").replace(/\s+/gim, " ");
  const expected = expectedOutputs[bundler]?.[bundlePath]?.replace(/\s+/gim, " ");

  expect(actual).toContain(expected);
}

test("esbuild bundle", () => {
  checkBundle("esbuild", "bundle1.js");
  checkBundle("esbuild", "bundle2.js");
});

test("rollup bundle", () => {
  checkBundle("rollup", "bundle1.js");
  checkBundle("rollup", "bundle2.js");
});

test("vite bundle", () => {
  checkBundle("vite", "bundle1.js");
  checkBundle("vite", "bundle2.js");
});

testIfNodeMajorVersionIsLessThan18("webpack 4 bundle", () => {
  checkBundle("webpack4", "bundle1.js");
  checkBundle("webpack4", "bundle2.js");
});

test("webpack 5 bundle", () => {
  checkBundle("webpack5", "bundle1.js");
  checkBundle("webpack5", "bundle2.js");
});
