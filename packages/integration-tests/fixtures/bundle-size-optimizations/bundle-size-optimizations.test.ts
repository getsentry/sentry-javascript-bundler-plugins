/* eslint-disable jest/no-standalone-expect */
/* eslint-disable jest/expect-expect */
import path from "path";
import fs from "fs";
import { testIfNodeMajorVersionIsLessThan18 } from "../../utils/testIf";

const expectedOutputs: Record<string, Record<string, string>> = {
  esbuild: {
    "bundle1.js": `function e(){let o=Math.random();return console.log("skip iframe",1),o}console.log(e());`,
    "bundle2.js": `function a(){return{debug:"b",trace:"b",replayCanvas:"a",replayIframe:"a",replayShadowDom:"a"}}console.log(a());`,
  },
  rollup: {
    "bundle1.js": `function run() {
  const a = Math.random();
  {
    const myNum = 1 ;
    console.log("skip iframe", myNum);
  }

  return a;
}

console.log(run());`,
    "bundle2.js": `function run() {
  const obj = {
    debug: "b",
    trace: "b",
    replayCanvas: "a" ,
    replayIframe: "a" ,
    replayShadowDom: "a" ,
  };

  return obj;
}

console.log(run());`,
  },
  vite: {
    "bundle1.js": `function d(){const e=Math.random();return console.log("skip iframe",1),e}console.log(d());`,
    "bundle2.js": `function n(){return{debug:"b",trace:"b",replayCanvas:"a",replayIframe:"a",replayShadowDom:"a"}}console.log(n());`,
  },
  webpack4: {
    "bundle1.js": `console.log(function(){const e=Math.random();{const e=1;console.log("skip iframe",e)}return e}())`,
    "bundle2.js": `console.log({debug:"b",trace:"b",replayCanvas:"a",replayIframe:"a",replayShadowDom:"a"})`,
  },
  webpack5: {
    "bundle1.js": `console.log(function(){const e=Math.random();{const e=1;console.log("skip iframe",e)}return e}())`,
    "bundle2.js": `console.log({debug:"b",trace:"b",replayCanvas:"a",replayIframe:"a",replayShadowDom:"a"});`,
  },
};

function checkBundle(bundler: string, bundlePath: string): void {
  const actualPath = path.join(__dirname, "out", bundler, bundlePath);

  const actual = fs.readFileSync(actualPath, "utf-8");
  const expected = expectedOutputs[bundler]?.[bundlePath];

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
