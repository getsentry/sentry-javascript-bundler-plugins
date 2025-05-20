import { createSentryBuildPluginManager } from "../src/build-plugin-manager";

describe("createSentryBuildPluginManager", () => {
  describe("when disabled", () => {
    it("initializes a no-op build plugin manager", () => {
      const buildPluginManager = createSentryBuildPluginManager(
        {
          disable: true,
        },
        {
          buildTool: "webpack",
          loggerPrefix: "[sentry-webpack-plugin]",
        }
      );

      expect(buildPluginManager).toBeDefined();
      expect(buildPluginManager.logger).toBeDefined();
      expect(buildPluginManager.normalizedOptions.disable).toBe(true);
    });

    it("does not log anything to the console", () => {
      const logSpy = jest.spyOn(console, "log");
      const infoSpy = jest.spyOn(console, "info");
      const debugSpy = jest.spyOn(console, "debug");
      const warnSpy = jest.spyOn(console, "warn");
      const errorSpy = jest.spyOn(console, "error");

      createSentryBuildPluginManager(
        {
          disable: true,
          release: {
            deploy: {
              // An empty string triggers a validation error (but satisfies the type checker)
              env: "",
            },
          },
        },
        {
          buildTool: "webpack",
          loggerPrefix: "[sentry-webpack-plugin]",
        }
      );

      expect(logSpy).not.toHaveBeenCalled();
      expect(infoSpy).not.toHaveBeenCalled();
      expect(debugSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });
});
