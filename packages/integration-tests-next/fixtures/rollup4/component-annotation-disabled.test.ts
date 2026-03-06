import { expect } from "vitest";
import { test } from "./utils";

test(import.meta.url, ({ runBundler, readOutputFiles }) => {
  runBundler();
  expect(readOutputFiles()).toMatchInlineSnapshot(`
    {
      "app.js": "!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{};e.SENTRY_RELEASE={id:"CURRENT_SHA"};var n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="e0d3404a-8cd2-4497-8ac0-7d0973080851",e._sentryDebugIdIdentifier="sentry-dbid-e0d3404a-8cd2-4497-8ac0-7d0973080851");}catch(e){}}();import { jsx, jsxs } from 'react/jsx-runtime';

    function ComponentA() {
      return /*#__PURE__*/jsx("span", {
        children: "Component A"
      });
    }

    function App() {
      return /*#__PURE__*/jsxs("span", {
        children: [/*#__PURE__*/jsx(ComponentA, {}), ";"]
      });
    }

    export { App as default };
    ",
    }
  `);
});
