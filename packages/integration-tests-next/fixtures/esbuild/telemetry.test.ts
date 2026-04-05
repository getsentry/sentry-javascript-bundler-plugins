import { expect } from "vitest";
import { test } from "./utils";

test(import.meta.url, ({ runBundler, readOutputFiles, runFileInNode }) => {
  runBundler();
  expect(readOutputFiles()).toMatchInlineSnapshot(`
    {
      "sentry-telemetry.json": "[{"sent_at":"TIMESTAMP","sdk":{"name":"sentry.javascript.node","version":"8.30.0"}},[[{"type":"session"},{"sid":"UUID","init":false,"started":"TIMESTAMP","timestamp":"TIMESTAMP","status":"exited","errors":0,"duration":DURATION,"attrs":{"release":"PLUGIN_VERSION","environment":"production"}}]]],
    ",
      "telemetry.js": "(() => {
      // _sentry-injection-stub
      !(function() {
        try {
          var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
          e.SENTRY_RELEASE = { id: "CURRENT_SHA" };
        } catch (e2) {
        }
      })();

      // sentry-debug-id-stub:_sentry-debug-id-injection-stub?sentry-module-id=35772989-29a2-4a00-ab11-2dde789c23b5
      !(function() {
        try {
          var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
          var n = new e.Error().stack;
          n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "b2f058af-3fdd-4cca-8393-3a34c992a9f8", e._sentryDebugIdIdentifier = "sentry-dbid-b2f058af-3fdd-4cca-8393-3a34c992a9f8");
        } catch (e2) {
        }
      })();

      // src/basic.js
      console.log("hello world");

      // src/basic.js?sentryDebugIdProxy=true
      var basic_default = void 0;
    })();
    ",
    }
  `);

  const output = runFileInNode("telemetry.js");
  expect(output).toBe("hello world\n");
});
