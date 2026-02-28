import { describe, test, expect, beforeAll } from "vitest";
import { runBundler, readAllFiles } from "../utils";
import { join } from "node:path";
import { rmSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";

const __dirname = new URL(".", import.meta.url).pathname;

const tempDirs: string[] = [];

function createTempDir(): string {
  const tempDir = mkdtempSync(join(tmpdir(), "sentry-bundler-plugin-" + randomUUID()));
  tempDirs.push(tempDir);
  return tempDir;
}

process.on("exit", () => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
});

function runRolldown(
  config: string,
  env: Record<string, string | undefined> = { ...process.env }
): void {
  runBundler(`rolldown --config ${config}`, { cwd: __dirname }, { ...process.env, ...env });
}

describe("rolldown", () => {
  beforeAll(() => {
    const outputDir = join(__dirname, "out");
    rmSync(outputDir, { recursive: true, force: true });
  });

  test("Basic", () => {
    runRolldown("basic.config.ts");
    const files = readAllFiles(join(__dirname, "out", "basic"));
    expect(files).toMatchInlineSnapshot(`
      {
        "basic.js": "//#region src/basic.js
      !function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{};e.SENTRY_RELEASE={id:"CURRENT_SHA"};var n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="b699d9c1-b033-4536-aa25-233c92609b54",e._sentryDebugIdIdentifier="sentry-dbid-b699d9c1-b033-4536-aa25-233c92609b54");}catch(e){}}();console.log("hello world");

      //#endregion",
      }
    `);
  });

  test("Basic with sourcemaps", () => {
    runRolldown("basic-sourcemaps.config.ts");
    const files = readAllFiles(join(__dirname, "out", "basic-sourcemaps"));
    expect(files).toMatchInlineSnapshot(`
      {
        "basic.js": "//#region src/basic.js
      !function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{};e.SENTRY_RELEASE={id:"CURRENT_SHA"};var n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="b699d9c1-b033-4536-aa25-233c92609b54",e._sentryDebugIdIdentifier="sentry-dbid-b699d9c1-b033-4536-aa25-233c92609b54");}catch(e){}}();console.log("hello world");

      //#endregion
      //# sourceMappingURL=basic.js.map",
        "basic.js.map": "{"version":3,"file":"basic.js","names":[],"sources":["../../src/basic.js"],"sourcesContent":["// eslint-disable-next-line no-console\\nconsole.log(\\"hello world\\");\\n"],"mappings":";scACA,OAAA,CAAQ,GAAA,CAAI,CAAA,KAAA,CAAA,KAAA,CAAA,CAAc"}",
      }
    `);
  });

  test("Release injection disabled", () => {
    runRolldown("basic-release-disabled.config.ts");
    const files = readAllFiles(join(__dirname, "out", "basic-release-disabled"));
    expect(files).toMatchInlineSnapshot(`
      {
        "basic.js": "//#region src/basic.js
      !function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{};var n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="b699d9c1-b033-4536-aa25-233c92609b54",e._sentryDebugIdIdentifier="sentry-dbid-b699d9c1-b033-4536-aa25-233c92609b54");}catch(e){}}();console.log("hello world");

      //#endregion",
      }
    `);
  });

  test("Debug ID injection disabled", () => {
    runRolldown("debugid-disabled.config.ts");
    const files = readAllFiles(join(__dirname, "out", "debugid-disabled"));
    expect(files).toMatchInlineSnapshot(`
      {
        "basic.js": "//#region src/basic.js
      console.log("hello world");

      //#endregion
      //# sourceMappingURL=basic.js.map",
        "basic.js.map": "{"version":3,"file":"basic.js","names":[],"sources":["../../src/basic.js"],"sourcesContent":["// eslint-disable-next-line no-console\\nconsole.log(\\"hello world\\");\\n"],"mappings":";AACA,QAAQ,IAAI,cAAc"}",
      }
    `);
  });

  test("Debug IDs already injected", () => {
    const tempDir = createTempDir();

    runRolldown("debugids-already-injected.config.ts", { SENTRY_TEST_OVERRIDE_TEMP_DIR: tempDir });
    const files = readAllFiles(tempDir);
    expect(files).toMatchInlineSnapshot(`
      {
        "b699d9c1-b033-4536-aa25-233c92609b54-0.js": "//#region src/basic.js
      !function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{};e.SENTRY_RELEASE={id:"CURRENT_SHA"};var n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="b699d9c1-b033-4536-aa25-233c92609b54",e._sentryDebugIdIdentifier="sentry-dbid-b699d9c1-b033-4536-aa25-233c92609b54");}catch(e){}}();console.log("hello world");

      //#endregion
      //# debugId=b699d9c1-b033-4536-aa25-233c92609b54
      //# sourceMappingURL=basic.js.map",
        "b699d9c1-b033-4536-aa25-233c92609b54-0.js.map": "{"version":3,"file":"basic.js","names":[],"sources":["../../src/basic.js"],"sourcesContent":["// eslint-disable-next-line no-console\\nconsole.log(\\"hello world\\");\\n"],"mappings":";scACA,OAAA,CAAQ,GAAA,CAAI,CAAA,KAAA,CAAA,KAAA,CAAA,CAAc","debugId":"b699d9c1-b033-4536-aa25-233c92609b54","debug_id":"b699d9c1-b033-4536-aa25-233c92609b54"}",
      }
    `);
  });

  test("Module metadata injection", () => {
    runRolldown("module-metadata.config.ts");
    const files = readAllFiles(join(__dirname, "out", "module-metadata"));
    expect(files).toMatchInlineSnapshot(`
      {
        "basic.js": "//#region src/basic.js
      !function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{};e.SENTRY_RELEASE={id:"CURRENT_SHA"};e._sentryModuleMetadata=e._sentryModuleMetadata||{},e._sentryModuleMetadata[(new e.Error).stack]=function(e){for(var n=1;n<arguments.length;n++){var a=arguments[n];if(null!=a)for(var t in a)a.hasOwnProperty(t)&&(e[t]=a[t])}return e}({},e._sentryModuleMetadata[(new e.Error).stack],{"something":"value","another":999});var n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="b699d9c1-b033-4536-aa25-233c92609b54",e._sentryDebugIdIdentifier="sentry-dbid-b699d9c1-b033-4536-aa25-233c92609b54");}catch(e){}}();console.log("hello world");

      //#endregion",
      }
    `);
  });

  test("Application key injection", () => {
    runRolldown("application-key.config.ts");
    const files = readAllFiles(join(__dirname, "out", "application-key"));
    expect(files).toMatchInlineSnapshot(`
      {
        "basic.js": "//#region src/basic.js
      !function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{};e.SENTRY_RELEASE={id:"CURRENT_SHA"};e._sentryModuleMetadata=e._sentryModuleMetadata||{},e._sentryModuleMetadata[(new e.Error).stack]=function(e){for(var n=1;n<arguments.length;n++){var a=arguments[n];if(null!=a)for(var t in a)a.hasOwnProperty(t)&&(e[t]=a[t])}return e}({},e._sentryModuleMetadata[(new e.Error).stack],{"_sentryBundlerPluginAppKey:1234567890abcdef":true});var n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="b699d9c1-b033-4536-aa25-233c92609b54",e._sentryDebugIdIdentifier="sentry-dbid-b699d9c1-b033-4536-aa25-233c92609b54");}catch(e){}}();console.log("hello world");

      //#endregion",
      }
    `);
  });

  test("Component annotation", () => {
    runRolldown("component-annotation.config.ts");
    const files = readAllFiles(join(__dirname, "out", "component-annotation"));
    expect(files).toMatchInlineSnapshot(`
      {
        "app.js": "!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{};e.SENTRY_RELEASE={id:"CURRENT_SHA"};var n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="adb3af3a-5b4a-49fd-b8ae-7ea0905020b6",e._sentryDebugIdIdentifier="sentry-dbid-adb3af3a-5b4a-49fd-b8ae-7ea0905020b6");}catch(e){}}();import { jsx, jsxs } from "../node_modules/react/jsx-runtime.js";

      //#region src/component-a.jsx
      function ComponentA() {
      	return /* @__PURE__ */ jsx("span", {
      		"data-sentry-component": "ComponentA",
      		"data-sentry-source-file": "component-a.jsx",
      		children: "Component A"
      	});
      }

      //#endregion
      //#region src/app.jsx
      function App() {
      	return /* @__PURE__ */ jsxs("span", {
      		"data-sentry-component": "App",
      		"data-sentry-source-file": "app.jsx",
      		children: [/* @__PURE__ */ jsx(ComponentA, {
      			"data-sentry-element": "ComponentA",
      			"data-sentry-source-file": "app.jsx"
      		}), ";"]
      	});
      }

      //#endregion
      export { App as default };",
      }
    `);
  });

  test("Component annotation disabled", () => {
    runRolldown("component-annotation-disabled.config.ts");
    const files = readAllFiles(join(__dirname, "out", "component-annotation-disabled"));
    expect(files).toMatchInlineSnapshot(`
      {
        "app.js": "!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{};e.SENTRY_RELEASE={id:"CURRENT_SHA"};var n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="ea5adc74-2664-4c38-8492-6e4971efd2be",e._sentryDebugIdIdentifier="sentry-dbid-ea5adc74-2664-4c38-8492-6e4971efd2be");}catch(e){}}();import { jsx, jsxs } from "../node_modules/react/jsx-runtime.js";

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

  test("Component annotation experimental", () => {
    runRolldown("component-annotation-next.config.ts");
    const files = readAllFiles(join(__dirname, "out", "component-annotation-next"));
    expect(files).toMatchInlineSnapshot(`
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

  test("Multiple entry points", () => {
    runRolldown("multiple-entry-points.config.ts");
    const files = readAllFiles(join(__dirname, "out", "multiple-entry-points"));
    expect(files).toMatchInlineSnapshot(`
      {
        "common.js": "//#region src/common.js
      !function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{};var n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="3f33b953-1cf1-4c05-850d-3f5b805fa101",e._sentryDebugIdIdentifier="sentry-dbid-3f33b953-1cf1-4c05-850d-3f5b805fa101");}catch(e){}}();function add(a, b) {
      	return a + b;
      }

      //#endregion
      export { add as t };",
        "entry1.js": "!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{};var n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="cbcd67c2-83a7-44e1-94e6-9a8ab161f162",e._sentryDebugIdIdentifier="sentry-dbid-cbcd67c2-83a7-44e1-94e6-9a8ab161f162");}catch(e){}}();import { t as add } from "./common.js";

      //#region src/entry1.js
      console.log(add(1, 2));

      //#endregion",
        "entry2.js": "!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{};var n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="a4f71127-2139-4e9f-af54-f35982254569",e._sentryDebugIdIdentifier="sentry-dbid-a4f71127-2139-4e9f-af54-f35982254569");}catch(e){}}();import { t as add } from "./common.js";

      //#region src/entry2.js
      console.log(add(2, 4));

      //#endregion",
      }
    `);
  });
});
