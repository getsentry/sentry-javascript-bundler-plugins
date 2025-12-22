import { Compiler } from "webpack";
import { getDebugIdSnippet, sentryUnpluginFactory, createRollupDebugIdInjectionHooks } from "../src";

describe("getDebugIdSnippet", () => {
  it("returns the debugId injection snippet for a passed debugId", () => {
    const snippet = getDebugIdSnippet("1234");
    expect(snippet).toMatchInlineSnapshot(
      `";{try{(function(){var e=\\"undefined\\"!=typeof window?window:\\"undefined\\"!=typeof global?global:\\"undefined\\"!=typeof globalThis?globalThis:\\"undefined\\"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]=\\"1234\\",e._sentryDebugIdIdentifier=\\"sentry-dbid-1234\\");})();}catch(e){}};"`
    );
  });
});

describe("createRollupDebugIdInjectionHooks", () => {
  const hooks = createRollupDebugIdInjectionHooks();

  describe("renderChunk", () => {
    it("should inject debug ID into clean JavaScript files", () => {
      const code = 'console.log("Hello world");';
      const result = hooks.renderChunk(code, { fileName: "bundle.js" });

      expect(result).not.toBeNull();
      expect(result?.code).toContain("_sentryDebugIdIdentifier");
      expect(result?.code).toContain('console.log("Hello world");');
    });

    it("should inject debug ID after 'use strict'", () => {
      const code = '"use strict";\nconsole.log("Hello world");';
      const result = hooks.renderChunk(code, { fileName: "bundle.js" });

      expect(result).not.toBeNull();
      expect(result?.code).toMatch(/^"use strict";.*;{try/);
    });

    it.each([
      ["bundle.js", true],
      ["bundle.mjs", true],
      ["bundle.cjs", true],
      ["bundle.js?foo=bar", true],
      ["bundle.js#hash", true],
      ["index.html", false],
      ["styles.css", false],
    ])("should process file '%s': %s", (fileName, shouldProcess) => {
      const code = 'console.log("test");';
      const result = hooks.renderChunk(code, { fileName });

      if (shouldProcess) {
        expect(result).not.toBeNull();
        expect(result?.code).toContain("_sentryDebugIdIdentifier");
      } else {
        expect(result).toBeNull();
      }
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
      expect(result).toBeNull();
    });

    it("should only check boundaries for performance (not entire file)", () => {
      // Inline format beyond first 2KB boundary
      const codeWithInlineBeyond2KB =
        "a".repeat(2100) +
        ';{try{(function(){var e="undefined"!=typeof window?window:e._sentryDebugIdIdentifier="sentry-dbid-existing-id");})();}catch(e){}};';

      expect(hooks.renderChunk(codeWithInlineBeyond2KB, { fileName: "bundle.js" })).not.toBeNull();

      // Comment format beyond last 500 bytes boundary
      const codeWithCommentBeyond500B =
        "//# debugId=f6ccd6f4-7ea0-4854-8384-1c9f8340af81\n" + "a".repeat(600);

      expect(hooks.renderChunk(codeWithCommentBeyond500B, { fileName: "bundle.js" })).not.toBeNull();
    });
  });
});

describe("sentryUnpluginFactory sourcemaps.disable behavior", () => {
  const mockReleaseInjectionPlugin = jest.fn((_injectionCode: string) => ({
    name: "mock-release-injection-plugin",
  }));

  const mockComponentNameAnnotatePlugin = jest.fn(() => ({
    name: "mock-component-name-annotate-plugin",
  }));

  const mockModuleMetadataInjectionPlugin = jest.fn((_injectionCode: string) => ({
    name: "mock-module-metadata-injection-plugin",
  }));

  const mockDebugIdInjectionPlugin = jest.fn(() => ({
    name: "mock-debug-id-injection-plugin",
  }));

  const mockDebugIdUploadPlugin = jest.fn(() => ({
    name: "mock-debug-id-upload-plugin",
  }));

  const mockBundleSizeOptimizationsPlugin = jest.fn(() => ({
    name: "mock-bundle-size-optimizations-plugin",
  }));

  const createUnpluginInstance = (): ReturnType<typeof sentryUnpluginFactory> => {
    return sentryUnpluginFactory({
      releaseInjectionPlugin: mockReleaseInjectionPlugin,
      componentNameAnnotatePlugin: mockComponentNameAnnotatePlugin,
      moduleMetadataInjectionPlugin: mockModuleMetadataInjectionPlugin,
      debugIdInjectionPlugin: mockDebugIdInjectionPlugin,
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
      expect(pluginNames).toContain("mock-debug-id-injection-plugin");
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
      expect(pluginNames).toContain("mock-debug-id-injection-plugin");
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
      expect(pluginNames).toContain("mock-debug-id-injection-plugin");
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
      expect(pluginNames).toContain("mock-debug-id-injection-plugin");
      expect(pluginNames).toContain("mock-debug-id-upload-plugin");

      // Should include other core plugins
      expect(pluginNames).toContain("sentry-telemetry-plugin");
      expect(pluginNames).toContain("sentry-release-management-plugin");
      expect(pluginNames).toContain("sentry-file-deletion-plugin");
    });
  });
});
