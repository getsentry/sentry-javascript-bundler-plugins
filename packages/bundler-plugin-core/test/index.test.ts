import { Compiler } from "webpack";
import { getDebugIdSnippet, sentryUnpluginFactory } from "../src";

describe("getDebugIdSnippet", () => {
  it("returns the debugId injection snippet for a passed debugId", () => {
    const snippet = getDebugIdSnippet("1234");
    expect(snippet).toMatchInlineSnapshot(
      `";{try{(function(){var e=\\"undefined\\"!=typeof window?window:\\"undefined\\"!=typeof global?global:\\"undefined\\"!=typeof globalThis?globalThis:\\"undefined\\"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]=\\"1234\\",e._sentryDebugIdIdentifier=\\"sentry-dbid-1234\\");})();}catch(e){}};"`
    );
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
