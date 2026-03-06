import { expect } from "vitest";
import { test } from "./utils";

test(import.meta.url, ({ runBundler, readOutputFiles }) => {
  runBundler();
  expect(readOutputFiles()).toMatchInlineSnapshot(`
    {
      "app.js": "!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{};e.SENTRY_RELEASE={id:"CURRENT_SHA"};var n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="b0a43d00-208c-4b0e-b024-c0951a1c11f8",e._sentryDebugIdIdentifier="sentry-dbid-b0a43d00-208c-4b0e-b024-c0951a1c11f8");}catch(e){}}();import { jsx, jsxs } from "../../../../../node_modules/react/jsx-runtime.js";

    //#region src/component-a.jsx
    function ComponentA() {
    	return /* @__PURE__ */ jsx("span", { children: "Component A" });
    }

    //#endregion
    //#region src/app.jsx
    function App() {
    	return /* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx(ComponentA, {}), ";"] });
    }

    //#endregion
    export { App as default };",
    }
  `);
});
