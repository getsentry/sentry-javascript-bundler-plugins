import { createSentryBuildPluginManager } from "../src/build-plugin-manager";
import fs from "fs";
import { glob } from "glob";
import { prepareBundleForDebugIdUpload } from "../src/debug-id-upload";

const mockCliExecute = jest.fn();
const mockCliUploadSourceMaps = jest.fn();

jest.mock("@sentry/cli", () => {
  return jest.fn().mockImplementation(() => ({
    execute: mockCliExecute,
    releases: {
      uploadSourceMaps: mockCliUploadSourceMaps,
      new: jest.fn(),
      finalize: jest.fn(),
      setCommits: jest.fn(),
      newDeploy: jest.fn(),
    },
  }));
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock("../src/sentry/telemetry", () => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  ...jest.requireActual("../src/sentry/telemetry"),
  safeFlushTelemetry: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock("@sentry/core", () => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  ...jest.requireActual("@sentry/core"),
  startSpan: jest.fn((options: unknown, callback: () => unknown) => callback()),
}));

jest.mock("glob");
jest.mock("../src/debug-id-upload");

const mockGlob = glob as jest.MockedFunction<typeof glob>;
const mockPrepareBundleForDebugIdUpload = prepareBundleForDebugIdUpload as jest.MockedFunction<
  typeof prepareBundleForDebugIdUpload
>;

describe("createSentryBuildPluginManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clean up environment variables
    delete process.env["SENTRY_LOG_LEVEL"];
  });

  describe("debug option", () => {
    it("should set SENTRY_LOG_LEVEL environment variable when debug is true", () => {
      createSentryBuildPluginManager(
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

      expect(process.env["SENTRY_LOG_LEVEL"]).toBe("debug");
    });

    it("should not set SENTRY_LOG_LEVEL environment variable when debug is false", () => {
      createSentryBuildPluginManager(
        {
          authToken: "test-token",
          org: "test-org",
          project: "test-project",
          debug: false,
        },
        {
          buildTool: "webpack",
          loggerPrefix: "[sentry-webpack-plugin]",
        }
      );

      expect(process.env["SENTRY_LOG_LEVEL"]).toBeUndefined();
    });

    it("should not set SENTRY_LOG_LEVEL environment variable when debug is not specified", () => {
      createSentryBuildPluginManager(
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

      expect(process.env["SENTRY_LOG_LEVEL"]).toBeUndefined();
    });

    it("should have SENTRY_LOG_LEVEL set when CLI operations are performed with debug enabled", async () => {
      mockCliExecute.mockImplementation(() => {
        // Verify the environment variable is set at the time the CLI is called
        expect(process.env["SENTRY_LOG_LEVEL"]).toBe("debug");
        return Promise.resolve(undefined);
      });

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

      // Verify it's set immediately after creation
      expect(process.env["SENTRY_LOG_LEVEL"]).toBe("debug");

      // Perform a CLI operation and verify the env var is still set
      await buildPluginManager.injectDebugIds(["/path/to/bundle"]);

      expect(mockCliExecute).toHaveBeenCalled();
    });

    it("should have SENTRY_LOG_LEVEL set during error scenarios with debug enabled", async () => {
      // Simulate CLI error
      mockCliExecute.mockImplementation(() => {
        // Verify the environment variable is set even when CLI encounters an error
        // This ensures the CLI won't emit the "Add --log-level=debug" warning
        expect(process.env["SENTRY_LOG_LEVEL"]).toBe("debug");
        return Promise.reject(new Error("CLI error"));
      });

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

      // Verify it's set before the error
      expect(process.env["SENTRY_LOG_LEVEL"]).toBe("debug");

      // Perform a CLI operation that will fail
      await buildPluginManager.injectDebugIds(["/path/to/bundle"]);

      // The error should have been caught, but env var should still be set
      expect(process.env["SENTRY_LOG_LEVEL"]).toBe("debug");
    });

    it("should NOT have SENTRY_LOG_LEVEL set during error scenarios when debug is disabled", async () => {
      // Simulate CLI error
      mockCliExecute.mockImplementation(() => {
        // Verify the environment variable is NOT set
        // In this case, the CLI WOULD emit the "Add --log-level=debug" warning
        expect(process.env["SENTRY_LOG_LEVEL"]).toBeUndefined();
        return Promise.reject(new Error("CLI error"));
      });

      const buildPluginManager = createSentryBuildPluginManager(
        {
          authToken: "test-token",
          org: "test-org",
          project: "test-project",
          debug: false,
        },
        {
          buildTool: "webpack",
          loggerPrefix: "[sentry-webpack-plugin]",
        }
      );

      // Verify it's not set
      expect(process.env["SENTRY_LOG_LEVEL"]).toBeUndefined();

      // Perform a CLI operation that will fail
      await buildPluginManager.injectDebugIds(["/path/to/bundle"]);

      // The error should have been caught, and env var should still not be set
      expect(process.env["SENTRY_LOG_LEVEL"]).toBeUndefined();
    });
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

  describe("uploadSourcemaps", () => {
    it("uploads in-place when prepareArtifacts is false", async () => {
      mockCliUploadSourceMaps.mockResolvedValue(undefined);

      const manager = createSentryBuildPluginManager(
        {
          authToken: "t",
          org: "o",
          project: "p",
          release: { name: "some-release-name", dist: "1" },
          sourcemaps: { assets: ["/app/dist/**/*"] },
        },
        { buildTool: "webpack", loggerPrefix: "[sentry-webpack-plugin]" }
      );

      await manager.uploadSourcemaps(["/unused"], { prepareArtifacts: false });

      expect(mockCliUploadSourceMaps).toHaveBeenCalledTimes(1);
      expect(mockCliUploadSourceMaps).toHaveBeenCalledWith(
        "some-release-name",
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          include: expect.arrayContaining([
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            expect.objectContaining({
              // User-provided assets should be passed directly to CLI (no globbing)
              paths: ["/app/dist/**/*"],
              rewrite: true,
              dist: "1",
            }),
          ]),
          live: "rejectOnError",
        })
      );
      // Should not glob when prepareArtifacts is false
      expect(mockGlob).not.toHaveBeenCalled();
      expect(mockPrepareBundleForDebugIdUpload).not.toHaveBeenCalled();
    });

    it("uploads build artifact paths when prepareArtifacts is false and no assets provided", async () => {
      mockCliUploadSourceMaps.mockResolvedValue(undefined);

      const manager = createSentryBuildPluginManager(
        {
          authToken: "t",
          org: "o",
          project: "p",
          release: { name: "some-release-name", dist: "1" },
          // No assets provided
        },
        { buildTool: "webpack", loggerPrefix: "[sentry-webpack-plugin]" }
      );

      await manager.uploadSourcemaps([".next", "dist"], { prepareArtifacts: false });

      expect(mockCliUploadSourceMaps).toHaveBeenCalledTimes(1);
      expect(mockCliUploadSourceMaps).toHaveBeenCalledWith(
        "some-release-name",
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          include: expect.arrayContaining([
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            expect.objectContaining({
              // Should use buildArtifactPaths directly
              paths: [".next", "dist"],
              rewrite: true,
              dist: "1",
            }),
          ]),
          live: "rejectOnError",
        })
      );
      expect(mockGlob).not.toHaveBeenCalled();
      expect(mockPrepareBundleForDebugIdUpload).not.toHaveBeenCalled();
    });

    it("exits early when assets is an empty array", async () => {
      const manager = createSentryBuildPluginManager(
        {
          authToken: "t",
          org: "o",
          project: "p",
          release: { name: "some-release-name", dist: "1" },
          sourcemaps: { assets: [] },
        },
        { buildTool: "webpack", loggerPrefix: "[sentry-webpack-plugin]" }
      );

      await manager.uploadSourcemaps([".next"], { prepareArtifacts: false });

      expect(mockCliUploadSourceMaps).not.toHaveBeenCalled();
      expect(mockGlob).not.toHaveBeenCalled();
      expect(mockPrepareBundleForDebugIdUpload).not.toHaveBeenCalled();
    });

    it("exits early when assets is an empty array even for default mode", async () => {
      const manager = createSentryBuildPluginManager(
        {
          authToken: "t",
          org: "o",
          project: "p",
          release: { name: "some-release-name", dist: "1" },
          sourcemaps: { assets: [] },
        },
        { buildTool: "webpack", loggerPrefix: "[sentry-webpack-plugin]" }
      );

      await manager.uploadSourcemaps([".next"]);

      expect(mockCliUploadSourceMaps).not.toHaveBeenCalled();
      expect(mockGlob).not.toHaveBeenCalled();
      expect(mockPrepareBundleForDebugIdUpload).not.toHaveBeenCalled();
    });

    it("prepares into temp folder and uploads when prepareArtifacts is true (default)", async () => {
      mockCliUploadSourceMaps.mockResolvedValue(undefined);

      mockGlob.mockResolvedValue(["/app/dist/a.js", "/app/dist/a.js.map", "/app/dist/other.txt"]);

      jest.spyOn(fs.promises, "mkdtemp").mockResolvedValue("/tmp/sentry-upload-xyz");
      jest.spyOn(fs.promises, "readdir").mockResolvedValue(["a.js", "a.js.map"] as never);
      jest.spyOn(fs.promises, "stat").mockResolvedValue({ size: 10 } as fs.Stats);
      jest.spyOn(fs.promises, "rm").mockResolvedValue(undefined as never);

      mockPrepareBundleForDebugIdUpload.mockResolvedValue(undefined);

      const manager = createSentryBuildPluginManager(
        {
          authToken: "t",
          org: "o",
          project: "p",
          release: { name: "some-release-name", dist: "1" },
          sourcemaps: { assets: ["/app/dist/**/*"] },
        },
        { buildTool: "webpack", loggerPrefix: "[sentry-webpack-plugin]" }
      );

      await manager.uploadSourcemaps(["/unused"]);

      // Should call prepare for each JS chunk discovered by glob
      expect(mockPrepareBundleForDebugIdUpload).toHaveBeenCalled();
      // Should upload from temp folder
      expect(mockCliUploadSourceMaps).toHaveBeenCalledWith("some-release-name", {
        include: [{ paths: ["/tmp/sentry-upload-xyz"], rewrite: false, dist: "1" }],
        live: "rejectOnError",
      });
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
