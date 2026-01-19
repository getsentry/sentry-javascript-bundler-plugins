import { Compiler } from "webpack";
import { getDebugIdSnippet, sentryUnpluginFactory, createRollupInjectionHooks } from "../src";
import { containsOnlyImports } from "../src/utils";

describe("getDebugIdSnippet", () => {
  it("returns the debugId injection snippet for a passed debugId", () => {
    const snippet = getDebugIdSnippet("1234");
    expect(snippet).toMatchInlineSnapshot(
      `";{try{(function(){var e=\\"undefined\\"!=typeof window?window:\\"undefined\\"!=typeof global?global:\\"undefined\\"!=typeof globalThis?globalThis:\\"undefined\\"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]=\\"1234\\",e._sentryDebugIdIdentifier=\\"sentry-dbid-1234\\");})();}catch(e){}};"`
    );
  });
});

describe("containsOnlyImports", () => {
  describe("should return true (import-only code)", () => {
    it.each([
      ["empty string", ""],
      ["whitespace only", "   \n\t  "],
      ["side effect import with single quotes", "import './module.js';"],
      ["side effect import with double quotes", 'import "./module.js";'],
      ["side effect import with backticks", "import `./module.js`;"],
      ["side effect import without semicolon", "import './module.js'"],
      ["default import", "import foo from './module.js';"],
      ["named import", "import { foo } from './module.js';"],
      ["named import with alias", "import { foo as bar } from './module.js';"],
      ["multiple named imports", "import { foo, bar, baz } from './module.js';"],
      ["namespace import", "import * as utils from './utils.js';"],
      ["default and named imports", "import React, { useState } from 'react';"],
      ["re-export all", "export * from './module.js';"],
      ["re-export named", "export { foo, bar } from './module.js';"],
      ["re-export with alias", "export { foo as default } from './module.js';"],
    ])("%s", (_, code) => {
      expect(containsOnlyImports(code)).toBe(true);
    });

    it.each([
      [
        "multiple imports",
        `
import './polyfill.js';
import { helper } from './utils.js';
import config from './config.js';
`,
      ],
      [
        "imports with line comments",
        `
// This is a comment
import './module.js';
// Another comment
`,
      ],
      [
        "imports with block comments",
        `
/* Block comment */
import './module.js';
/* Multi
   line
   comment */
`,
      ],
      ["'use strict' with imports", `"use strict";\nimport './module.js';`],
      ["'use strict' with single quotes", `'use strict';\nimport './module.js';`],
      [
        "mixed imports, re-exports, and comments",
        `
"use strict";
// Entry point facade
import './polyfills.js';
import { init } from './app.js';
/* Re-export for external use */
export * from './types.js';
export { config } from './config.js';
`,
      ],
    ])("%s", (_, code) => {
      expect(containsOnlyImports(code)).toBe(true);
    });
  });

  describe("should return false (contains substantial code)", () => {
    it.each([
      ["variable declaration", "const x = 1;"],
      ["let declaration", "let y = 2;"],
      ["var declaration", "var z = 3;"],
      ["function declaration", "function foo() {}"],
      ["arrow function", "const fn = () => {};"],
      ["class declaration", "class MyClass {}"],
      ["function call", "console.log('hello');"],
      ["IIFE", "(function() {})();"],
      ["expression statement", "1 + 1;"],
      ["object literal", "({ foo: 'bar' });"],
      ["export declaration (not re-export)", "export const foo = 1;"],
      ["export default expression", "export default {};"],
      ["export function", "export function foo() {}"],
      ["minified bundle code", `import{a as e}from"./chunk.js";var t=function(){return e()};t();`],
    ])("%s", (_, code) => {
      expect(containsOnlyImports(code)).toBe(false);
    });

    // Multi-line code snippets
    it.each([
      [
        "import followed by code",
        `
import { init } from './app.js';
init();
`,
      ],
      [
        "import with variable declaration",
        `
import './module.js';
const config = { debug: true };
`,
      ],
      [
        "import with function declaration",
        `
import { helper } from './utils.js';
function main() {
  helper();
}
`,
      ],
      [
        "real-world SPA bundle snippet",
        `
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(router);
app.mount('#app');
`,
      ],
    ])("%s", (_, code) => {
      expect(containsOnlyImports(code)).toBe(false);
    });
  });
});

describe("createRollupInjectionHooks", () => {
  const hooks = createRollupInjectionHooks("", true);

  describe("renderChunk", () => {
    it("should inject debug ID into clean JavaScript files", () => {
      const code = 'console.log("Hello world");';
      const result = hooks.renderChunk(code, { fileName: "bundle.js" });

      expect(result).not.toBeNull();
      expect(result?.code).toMatchInlineSnapshot(
        `";{try{(function(){var e=\\"undefined\\"!=typeof window?window:\\"undefined\\"!=typeof global?global:\\"undefined\\"!=typeof globalThis?globalThis:\\"undefined\\"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]=\\"d4309f93-5358-4ae1-bcf0-3813aa590eb5\\",e._sentryDebugIdIdentifier=\\"sentry-dbid-d4309f93-5358-4ae1-bcf0-3813aa590eb5\\");})();}catch(e){}};console.log(\\"Hello world\\");"`
      );
    });

    it("should inject debug ID after 'use strict'", () => {
      const code = '"use strict";\nconsole.log("Hello world");';
      const result = hooks.renderChunk(code, { fileName: "bundle.js" });

      expect(result).not.toBeNull();
      expect(result?.code).toMatchInlineSnapshot(`
        "\\"use strict\\";;{try{(function(){var e=\\"undefined\\"!=typeof window?window:\\"undefined\\"!=typeof global?global:\\"undefined\\"!=typeof globalThis?globalThis:\\"undefined\\"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]=\\"79a86c07-8ecc-4367-82b0-88cf822f2d41\\",e._sentryDebugIdIdentifier=\\"sentry-dbid-79a86c07-8ecc-4367-82b0-88cf822f2d41\\");})();}catch(e){}};
        console.log(\\"Hello world\\");"
      `);
    });

    it.each([
      ["bundle.js"],
      ["bundle.mjs"],
      ["bundle.cjs"],
      ["bundle.js?foo=bar"],
      ["bundle.js#hash"],
    ])("should process file '%s': %s", (fileName) => {
      const code = 'console.log("test");';
      const result = hooks.renderChunk(code, { fileName });

      expect(result).not.toBeNull();
      expect(result?.code).toMatchInlineSnapshot(
        `";{try{(function(){var e=\\"undefined\\"!=typeof window?window:\\"undefined\\"!=typeof global?global:\\"undefined\\"!=typeof globalThis?globalThis:\\"undefined\\"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]=\\"b80112c0-6818-486d-96f0-185c023439b4\\",e._sentryDebugIdIdentifier=\\"sentry-dbid-b80112c0-6818-486d-96f0-185c023439b4\\");})();}catch(e){}};console.log(\\"test\\");"`
      );
    });

    it.each([["index.html"], ["styles.css"]])("should NOT process file '%s': %s", (fileName) => {
      const code = 'console.log("test");';
      const result = hooks.renderChunk(code, { fileName });

      expect(result).toBeNull();
    });

    it.each([
      [
        "inline format at start",
        ';{try{(function(){var e="undefined"!=typeof window?window:e._sentryDebugIdIdentifier="sentry-dbid-existing-id");})();}catch(e){}};console.log("test");',
      ],
      [
        "comment format at end",
        'console.log("test");\n//# debugId=f6ccd6f4-7ea0-4854-8384-1c9f8340af81\n//# sourceMappingURL=bundle.js.map',
      ],
      [
        "inline format with large file",
        '"use strict";\n' +
          "// comment\n".repeat(10) +
          ';{try{(function(){var e="undefined"!=typeof window?window:e._sentryDebugIdIdentifier="sentry-dbid-existing-id");})();}catch(e){}};' +
          '\nconsole.log("line");\n'.repeat(100),
      ],
    ])("should NOT inject when debug ID already exists (%s)", (_description, code) => {
      const result = hooks.renderChunk(code, { fileName: "bundle.js" });
      expect(result?.code).not.toContain("_sentryDebugIds");
    });

    it("should only check boundaries for performance (not entire file)", () => {
      // Inline format beyond first 6KB boundary
      const codeWithInlineBeyond6KB =
        "a".repeat(6100) +
        ';{try{(function(){var e="undefined"!=typeof window?window:e._sentryDebugIdIdentifier="sentry-dbid-existing-id");})();}catch(e){}};';

      expect(hooks.renderChunk(codeWithInlineBeyond6KB, { fileName: "bundle.js" })).not.toBeNull();

      // Comment format beyond last 500 bytes boundary
      const codeWithCommentBeyond500B =
        "//# debugId=f6ccd6f4-7ea0-4854-8384-1c9f8340af81\n" + "a".repeat(600);

      expect(
        hooks.renderChunk(codeWithCommentBeyond500B, { fileName: "bundle.js" })
      ).not.toBeNull();
    });

    describe("HTML facade chunks (MPA vs SPA)", () => {
      // Issue #829: MPA facades should be skipped
      // Regression fix: SPA main bundles with HTML facades should NOT be skipped

      it.each([
        ["empty", ""],
        ["only side-effect imports", `import './shared-module.js';`],
        ["only named imports", `import { foo, bar } from './shared-module.js';`],
        ["only re-exports", `export * from './shared-module.js';`],
        [
          "multiple imports and comments",
          `// This is a facade module
import './moduleA.js';
import { x } from './moduleB.js';
/* block comment */
export * from './moduleC.js';`,
        ],
        ["'use strict' and imports only", `"use strict";\nimport './shared-module.js';`],
        ["query string in facadeModuleId", `import './shared.js';`, "?query=param"],
        ["hash in facadeModuleId", `import './shared.js';`, "#hash"],
      ])("should SKIP HTML facade chunks: %s", (_, code, suffix = "") => {
        const result = hooks.renderChunk(code, {
          fileName: "page1.js",
          facadeModuleId: `/path/to/page1.html${suffix}`,
        });
        expect(result).toBeNull();
      });

      it("should inject into HTML facade with function declarations", () => {
        const result = hooks.renderChunk(`function main() { console.log("hello"); }`, {
          fileName: "index.js",
          facadeModuleId: "/path/to/index.html",
        });
        expect(result).not.toBeNull();
        expect(result?.code).toMatchInlineSnapshot(
          `";{try{(function(){var e=\\"undefined\\"!=typeof window?window:\\"undefined\\"!=typeof global?global:\\"undefined\\"!=typeof globalThis?globalThis:\\"undefined\\"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]=\\"c4c89e04-3658-4874-b25b-07e638185091\\",e._sentryDebugIdIdentifier=\\"sentry-dbid-c4c89e04-3658-4874-b25b-07e638185091\\");})();}catch(e){}};function main() { console.log(\\"hello\\"); }"`
        );
      });

      it("should inject into HTML facade with variable declarations", () => {
        const result = hooks.renderChunk(`const x = 42;`, {
          fileName: "index.js",
          facadeModuleId: "/path/to/index.html",
        });
        expect(result).not.toBeNull();
        expect(result?.code).toMatchInlineSnapshot(
          `";{try{(function(){var e=\\"undefined\\"!=typeof window?window:\\"undefined\\"!=typeof global?global:\\"undefined\\"!=typeof globalThis?globalThis:\\"undefined\\"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]=\\"43e69766-1963-49f2-a291-ff8de60cc652\\",e._sentryDebugIdIdentifier=\\"sentry-dbid-43e69766-1963-49f2-a291-ff8de60cc652\\");})();}catch(e){}};const x = 42;"`
        );
      });

      it("should inject into HTML facade with substantial code (SPA main bundle)", () => {
        const code = `import { initApp } from './app.js';

const config = { debug: true };

function bootstrap() {
  initApp(config);
}

bootstrap();`;
        const result = hooks.renderChunk(code, {
          fileName: "index.js",
          facadeModuleId: "/path/to/index.html",
        });
        expect(result).not.toBeNull();
        expect(result?.code).toMatchInlineSnapshot(`
          ";{try{(function(){var e=\\"undefined\\"!=typeof window?window:\\"undefined\\"!=typeof global?global:\\"undefined\\"!=typeof globalThis?globalThis:\\"undefined\\"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]=\\"d0c4524b-496e-45a4-9852-7558d043ba3c\\",e._sentryDebugIdIdentifier=\\"sentry-dbid-d0c4524b-496e-45a4-9852-7558d043ba3c\\");})();}catch(e){}};import { initApp } from './app.js';

          const config = { debug: true };

          function bootstrap() {
            initApp(config);
          }

          bootstrap();"
        `);
      });

      it("should inject into HTML facade with mixed imports and code", () => {
        const result = hooks.renderChunk(
          `import './polyfills.js';\nimport { init } from './app.js';\n\ninit();`,
          { fileName: "index.js", facadeModuleId: "/path/to/index.html" }
        );
        expect(result).not.toBeNull();
        expect(result?.code).toMatchInlineSnapshot(`
          ";{try{(function(){var e=\\"undefined\\"!=typeof window?window:\\"undefined\\"!=typeof global?global:\\"undefined\\"!=typeof globalThis?globalThis:\\"undefined\\"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]=\\"28f0bbaa-9aeb-40c4-98c9-4e44f1d4e175\\",e._sentryDebugIdIdentifier=\\"sentry-dbid-28f0bbaa-9aeb-40c4-98c9-4e44f1d4e175\\");})();}catch(e){}};import './polyfills.js';
          import { init } from './app.js';

          init();"
        `);
      });

      it("should inject into regular JS chunks (no HTML facade)", () => {
        const result = hooks.renderChunk(`console.log("Hello");`, { fileName: "bundle.js" });
        expect(result).not.toBeNull();
        expect(result?.code).toMatchInlineSnapshot(
          `";{try{(function(){var e=\\"undefined\\"!=typeof window?window:\\"undefined\\"!=typeof global?global:\\"undefined\\"!=typeof globalThis?globalThis:\\"undefined\\"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]=\\"79f18a7f-ca16-4168-9797-906c82058367\\",e._sentryDebugIdIdentifier=\\"sentry-dbid-79f18a7f-ca16-4168-9797-906c82058367\\");})();}catch(e){}};console.log(\\"Hello\\");"`
        );
      });
    });
  });
});

describe("sentryUnpluginFactory sourcemaps.disable behavior", () => {
  const mockComponentNameAnnotatePlugin = jest.fn(() => ({
    name: "mock-component-name-annotate-plugin",
  }));

  const mockInjectionPlugin = jest.fn(() => ({
    name: "mock-injection-plugin",
  }));

  const mockDebugIdUploadPlugin = jest.fn(() => ({
    name: "mock-debug-id-upload-plugin",
  }));

  const mockBundleSizeOptimizationsPlugin = jest.fn(() => ({
    name: "mock-bundle-size-optimizations-plugin",
  }));

  const createUnpluginInstance = (): ReturnType<typeof sentryUnpluginFactory> => {
    return sentryUnpluginFactory({
      injectionPlugin: mockInjectionPlugin,
      componentNameAnnotatePlugin: mockComponentNameAnnotatePlugin,
      debugIdUploadPlugin: mockDebugIdUploadPlugin,
      bundleSizeOptimizationsPlugin: mockBundleSizeOptimizationsPlugin,
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("when sourcemaps.disable is true", () => {
    it("should not include debug ID injection or upload plugins", () => {
      const unpluginInstance = createUnpluginInstance();

      const plugins = unpluginInstance.raw(
        {
          authToken: "test-token",
          org: "test-org",
          project: "test-project",
          sourcemaps: {
            disable: true,
          },
        },
        { framework: "webpack", webpack: { compiler: {} as Compiler } }
      );

      const pluginNames = plugins.map((plugin) => plugin.name);

      // Should not include debug ID related plugins
      expect(pluginNames).not.toContain("mock-debug-id-injection-plugin");
      expect(pluginNames).not.toContain("mock-debug-id-upload-plugin");

      // Should still include other core plugins
      expect(pluginNames).toContain("sentry-telemetry-plugin");
      expect(pluginNames).toContain("sentry-release-management-plugin");
      expect(pluginNames).toContain("sentry-file-deletion-plugin");
    });
  });

  describe('when sourcemaps.disable is "disable-upload"', () => {
    it("should include debug ID injection plugin but not upload plugin", () => {
      const unpluginInstance = createUnpluginInstance();

      const plugins = unpluginInstance.raw(
        {
          authToken: "test-token",
          org: "test-org",
          project: "test-project",
          sourcemaps: {
            disable: "disable-upload",
          },
        },
        { framework: "webpack", webpack: { compiler: {} as Compiler } }
      );

      const pluginNames = plugins.map((plugin) => plugin.name);

      // Should include debug ID injection but not upload
      expect(pluginNames).toContain("mock-injection-plugin");
      expect(pluginNames).not.toContain("mock-debug-id-upload-plugin");

      // Should still include other core plugins
      expect(pluginNames).toContain("sentry-telemetry-plugin");
      expect(pluginNames).toContain("sentry-release-management-plugin");
      expect(pluginNames).toContain("sentry-file-deletion-plugin");
    });
  });

  describe("when sourcemaps.disable is false", () => {
    it("should include both debug ID injection and upload plugins", () => {
      const unpluginInstance = createUnpluginInstance();

      const plugins = unpluginInstance.raw(
        {
          authToken: "test-token",
          org: "test-org",
          project: "test-project",
          sourcemaps: {
            disable: false,
          },
        },
        { framework: "webpack", webpack: { compiler: {} as Compiler } }
      );

      const pluginNames = plugins.map((plugin) => plugin.name);

      // Should include both debug ID related plugins
      expect(pluginNames).toContain("mock-injection-plugin");
      expect(pluginNames).toContain("mock-debug-id-upload-plugin");

      // Should include other core plugins
      expect(pluginNames).toContain("sentry-telemetry-plugin");
      expect(pluginNames).toContain("sentry-release-management-plugin");
      expect(pluginNames).toContain("sentry-file-deletion-plugin");
    });
  });

  describe("when sourcemaps.disable is undefined (default)", () => {
    it("should include both debug ID injection and upload plugins", () => {
      const unpluginInstance = createUnpluginInstance();

      const plugins = unpluginInstance.raw(
        {
          authToken: "test-token",
          org: "test-org",
          project: "test-project",
          // sourcemaps.disable not specified (undefined)
        },
        { framework: "webpack", webpack: { compiler: {} as Compiler } }
      );

      const pluginNames = plugins.map((plugin) => plugin.name);

      // Should include both debug ID related plugins by default
      expect(pluginNames).toContain("mock-injection-plugin");
      expect(pluginNames).toContain("mock-debug-id-upload-plugin");

      // Should include other core plugins
      expect(pluginNames).toContain("sentry-telemetry-plugin");
      expect(pluginNames).toContain("sentry-release-management-plugin");
      expect(pluginNames).toContain("sentry-file-deletion-plugin");
    });
  });

  describe("when entire sourcemaps option is undefined", () => {
    it("should include both debug ID injection and upload plugins", () => {
      const unpluginInstance = createUnpluginInstance();

      const plugins = unpluginInstance.raw(
        {
          authToken: "test-token",
          org: "test-org",
          project: "test-project",
          // sourcemaps option not specified at all
        },
        { framework: "webpack", webpack: { compiler: {} as Compiler } }
      );

      const pluginNames = plugins.map((plugin) => plugin.name);

      // Should include both debug ID related plugins by default
      expect(pluginNames).toContain("mock-injection-plugin");
      expect(pluginNames).toContain("mock-debug-id-upload-plugin");

      // Should include other core plugins
      expect(pluginNames).toContain("sentry-telemetry-plugin");
      expect(pluginNames).toContain("sentry-release-management-plugin");
      expect(pluginNames).toContain("sentry-file-deletion-plugin");
    });
  });
});
