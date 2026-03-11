import { expect } from "vitest";
import { test } from "./utils";

test(import.meta.url, ({ runBundler, readOutputFiles }) => {
  runBundler();
  expect(readOutputFiles()).toMatchInlineSnapshot(`
    {
      "app.js": "!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{};e.SENTRY_RELEASE={id:"CURRENT_SHA"};var n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="4bdf6d53-8b4d-4766-b048-143c5e6d2cbd",e._sentryDebugIdIdentifier="sentry-dbid-4bdf6d53-8b4d-4766-b048-143c5e6d2cbd");}catch(e){}}();import { jsx, jsxs } from "../../../../../node_modules/react/jsx-runtime.js";

    //#region src/component-a.jsx
    function ComponentA() {
    	return /* @__PURE__ */ jsx("span", {
    		"data-sentry-component": "ComponentA",
    		children: "Component A"
    	});
    }

    //#endregion
    //#region src/app.jsx
    function App() {
    	return /* @__PURE__ */ jsxs("span", {
    		"data-sentry-component": "App",
    		children: [/* @__PURE__ */ jsx(ComponentA, {}), ";"]
    	});
    }

    //#endregion
    export { App as default };",
    }
  `);
});
