import { expect } from "vitest";
import { test } from "./utils";

test(import.meta.url, ({ runBundler, readOutputFiles }) => {
  runBundler();
  expect(readOutputFiles()).toMatchInlineSnapshot(`
    {
      "app.js": "!(function() {
      try {
        var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : {};
        e.SENTRY_RELEASE = { id: "CURRENT_SHA" };
        var n = new e.Error().stack;
        n && (e._sentryDebugIds = e._sentryDebugIds || {}, e._sentryDebugIds[n] = "4526461d-50db-4c34-9b8a-32821f20e536", e._sentryDebugIdIdentifier = "sentry-dbid-4526461d-50db-4c34-9b8a-32821f20e536");
      } catch (e2) {
      }
    })();
    import "../../../../../node_modules/react/jsx-dev-runtime.js";
    ",
    }
  `);
});
