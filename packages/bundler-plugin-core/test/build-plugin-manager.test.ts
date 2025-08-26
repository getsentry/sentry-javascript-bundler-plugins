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

      // Return a mixture of files/dirs; in-place path should pass through as-is
      mockGlob.mockResolvedValue(["/app/dist/a.js", "/app/dist/dir", "/app/dist/a.js.map"]);

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
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              paths: expect.arrayContaining([
                "/app/dist/a.js",
                "/app/dist/dir",
                "/app/dist/a.js.map",
              ]),
              rewrite: false,
              dist: "1",
            }),
          ]),
          live: "rejectOnError",
        })
      );
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
