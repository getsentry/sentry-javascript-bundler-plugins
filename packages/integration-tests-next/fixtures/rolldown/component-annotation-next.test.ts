import { expect } from "vitest";
import { test } from "./utils";

test(import.meta.url, ({ runRolldown, readOutputFiles }) => {
  runRolldown();
  expect(readOutputFiles()).toMatchInlineSnapshot(`
      {
        "app.js": "!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{};e.SENTRY_RELEASE={id:"CURRENT_SHA"};var n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="aa1666c7-eaca-4b84-8c40-9ac56cc75bfb",e._sentryDebugIdIdentifier="sentry-dbid-aa1666c7-eaca-4b84-8c40-9ac56cc75bfb");}catch(e){}}();import { jsx, jsxs } from "../node_modules/react/jsx-runtime.js";

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
