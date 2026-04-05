import { expect } from "vitest";
import { test } from "./utils";

test(import.meta.url, ({ runBundler, readOutputFiles, runFileInNode }) => {
  runBundler();
  expect(readOutputFiles()).toMatchInlineSnapshot(`
    {
      "bundle-size-optimizations.js": "(() => {
      // _sentry-injection-stub
      !(function() {
        try {
          var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
          e.SENTRY_RELEASE = { id: "CURRENT_SHA" };
        } catch (e2) {
        }
      })();

      // sentry-debug-id-stub:_sentry-debug-id-injection-stub?sentry-module-id=f831ef62-0aba-4f21-9c68-1e7534d72124
      !(function() {
        try {
          var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
          var n = new e.Error().stack;
          n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "9d04d57b-c444-4e10-904f-9a1eca8c239a", e._sentryDebugIdIdentifier = "sentry-dbid-9d04d57b-c444-4e10-904f-9a1eca8c239a");
        } catch (e2) {
        }
      })();

      // src/bundle.js
      console.log(
        JSON.stringify({
          debug: false ? "a" : "b",
          trace: false ? "a" : "b",
          replayCanvas: true ? "a" : "b",
          replayIframe: true ? "a" : "b",
          replayShadowDom: true ? "a" : "b",
          replayWorker: true ? "a" : "b"
        })
      );

      // src/bundle.js?sentryDebugIdProxy=true
      var bundle_default = void 0;
    })();
    ",
    }
  `);

  const output = runFileInNode("bundle-size-optimizations.js");
  expect(output).toBe(
    '{"debug":"b","trace":"b","replayCanvas":"a","replayIframe":"a","replayShadowDom":"a","replayWorker":"a"}\n'
  );
});
