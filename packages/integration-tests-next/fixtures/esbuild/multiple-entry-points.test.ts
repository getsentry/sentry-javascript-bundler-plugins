import { expect } from "vitest";
import { test } from "./utils";

test(import.meta.url, ({ runBundler, readOutputFiles, runFileInNode }) => {
  runBundler();
  expect(readOutputFiles()).toMatchInlineSnapshot(`
    {
      "chunk.js": "// src/common.js
    function add(a, b) {
      return a + b;
    }

    export {
      add
    };
    ",
      "entry1.js": "import {
      add
    } from "./chunk.js";

    // sentry-debug-id-stub:_sentry-debug-id-injection-stub?sentry-module-id=24dd1f0c-68a8-4235-8490-299463364fe5
    !(function() {
      try {
        var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
        var n = new e.Error().stack;
        n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "faec67e2-efc7-4a35-a05b-52f899f5a81c", e._sentryDebugIdIdentifier = "sentry-dbid-faec67e2-efc7-4a35-a05b-52f899f5a81c");
      } catch (e2) {
      }
    })();

    // src/entry1.js
    console.log(add(1, 2));

    // src/entry1.js?sentryDebugIdProxy=true
    var entry1_default = void 0;
    export {
      entry1_default as default
    };
    ",
      "entry2.js": "import {
      add
    } from "./chunk.js";

    // sentry-debug-id-stub:_sentry-debug-id-injection-stub?sentry-module-id=2c350a5f-13d4-4a2a-a0fd-b478b231fe0c
    !(function() {
      try {
        var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
        var n = new e.Error().stack;
        n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "3673342a-03c7-4fd3-9248-302bc3cc793f", e._sentryDebugIdIdentifier = "sentry-dbid-3673342a-03c7-4fd3-9248-302bc3cc793f");
      } catch (e2) {
      }
    })();

    // src/entry2.js
    console.log(add(2, 4));

    // src/entry2.js?sentryDebugIdProxy=true
    var entry2_default = void 0;
    export {
      entry2_default as default
    };
    ",
    }
  `);

  const output1 = runFileInNode("entry1.js");
  expect(output1).toMatchInlineSnapshot(`
    "3
    "
  `);
  const output2 = runFileInNode("entry2.js");
  expect(output2).toMatchInlineSnapshot(`
    "6
    "
  `);
});
