import { expect } from "vitest";
import { test } from "./utils";

test(import.meta.url, ({ runBundler, readOutputFiles, runFileInNode, createTempDir }) => {
  const tempUploadDir = createTempDir();

  runBundler({ SENTRY_UPLOAD_DIR: tempUploadDir });
  expect(readOutputFiles()).toMatchInlineSnapshot(`
    {
      "after-upload-deletion.js": "(() => {
      // _sentry-injection-stub
      !(function() {
        try {
          var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
          e.SENTRY_RELEASE = { id: "CURRENT_SHA" };
        } catch (e2) {
        }
      })();

      // sentry-debug-id-stub:_sentry-debug-id-injection-stub?sentry-module-id=0b47a7df-9bd6-49af-b000-120af50210e7
      !(function() {
        try {
          var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
          var n = new e.Error().stack;
          n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "22bc3889-65fe-4261-864b-14743cb882fc", e._sentryDebugIdIdentifier = "sentry-dbid-22bc3889-65fe-4261-864b-14743cb882fc");
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

  const output = runFileInNode("after-upload-deletion.js");
  expect(output).toBe("hello world\n");
});
