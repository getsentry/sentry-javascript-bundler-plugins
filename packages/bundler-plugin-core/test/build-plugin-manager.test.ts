import { createSentryBuildPluginManager } from "../src/build-plugin-manager";

const mockCliExecute = jest.fn();
jest.mock("@sentry/cli", () => {
  return jest.fn().mockImplementation(() => ({
    execute: mockCliExecute,
  }));
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock("../src/sentry/telemetry", () => ({
  ...jest.requireActual("../src/sentry/telemetry"),
  safeFlushTelemetry: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock("@sentry/core", () => ({
  ...jest.requireActual("@sentry/core"),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
  startSpan: jest.fn((options, callback) => callback()),
}));

describe("createSentryBuildPluginManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  describe("injectDebugIds", () => {
    it("should call CLI with correct sourcemaps inject command", async () => {
      mockCliExecute.mockResolvedValue(undefined);

      const buildPluginManager = createSentryBuildPluginManager(
        {
          authToken: "test-token",
          org: "test-org",
          project: "test-project",
        },
        {
          buildTool: "webpack",
          loggerPrefix: "[sentry-webpack-plugin]",
        }
      );

      const buildArtifactPaths = ["/path/to/1", "/path/to/2"];
      await buildPluginManager.injectDebugIds(buildArtifactPaths);

      expect(mockCliExecute).toHaveBeenCalledWith(
        ["sourcemaps", "inject", "/path/to/1", "/path/to/2"],
        false
      );
    });

    it("should pass debug flag when options.debug is true", async () => {
      mockCliExecute.mockResolvedValue(undefined);

      const buildPluginManager = createSentryBuildPluginManager(
        {
          authToken: "test-token",
          org: "test-org",
          project: "test-project",
          debug: true,
        },
        {
          buildTool: "webpack",
          loggerPrefix: "[sentry-webpack-plugin]",
        }
      );

      const buildArtifactPaths = ["/path/to/bundle"];
      await buildPluginManager.injectDebugIds(buildArtifactPaths);

      expect(mockCliExecute).toHaveBeenCalledWith(
        ["sourcemaps", "inject", "/path/to/bundle"],
        true
      );
    });
  });
});
