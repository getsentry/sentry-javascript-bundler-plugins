import { createSentryBuildPluginManager } from "../src/build-plugin-manager";
import SentryCli from "@sentry/cli";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

jest.mock("@sentry/cli");
const MockedSentryCli = SentryCli as jest.MockedClass<typeof SentryCli>;

interface MockSentryCliInstance {
  releases: {
    new: jest.MockedFunction<(release: string) => Promise<string>>;
    uploadSourceMaps: jest.MockedFunction<
      (
        release: string,
        options: {
          include: Array<{
            paths: string[];
            ext: string[];
            validate: boolean;
            ignore?: string[];
          }>;
          dist?: string;
        }
      ) => Promise<string>
    >;
    setCommits: jest.MockedFunction<(release: string, options: unknown) => Promise<string>>;
    finalize: jest.MockedFunction<(release: string, options?: unknown) => Promise<string>>;
    newDeploy: jest.MockedFunction<(release: string, options: unknown) => Promise<string>>;
    proposeVersion: jest.MockedFunction<() => Promise<string>>;
    listDeploys: jest.MockedFunction<(release: string, options?: unknown) => Promise<string>>;
    execute: jest.MockedFunction<(args: string[], live?: boolean) => Promise<string>>;
  };
}

describe("uploadLegacySourcemaps glob expansion", () => {
  let tempDir: string;
  let mockCliInstance: MockSentryCliInstance;

  beforeEach(async () => {
    jest.clearAllMocks();
    tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "sentry-test-"));

    mockCliInstance = {
      releases: {
        new: jest.fn().mockResolvedValue(""),
        uploadSourceMaps: jest.fn().mockResolvedValue(""),
        setCommits: jest.fn().mockResolvedValue(""),
        finalize: jest.fn().mockResolvedValue(""),
        newDeploy: jest.fn().mockResolvedValue(""),
        proposeVersion: jest.fn().mockResolvedValue(""),
        listDeploys: jest.fn().mockResolvedValue(""),
        execute: jest.fn().mockResolvedValue(""),
      },
    };

    MockedSentryCli.mockImplementation(() => mockCliInstance as unknown as SentryCli);

    const testFiles = ["dist/beep.js", "dist/boop.js"];

    for (const file of testFiles) {
      const fullPath = path.join(tempDir, file);
      await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.promises.writeFile(fullPath, "test content");
    }
  });

  afterEach(async () => {
    await fs.promises.rm(tempDir, { recursive: true, force: true });
  });

  it("should expand a basic glob pattern", async () => {
    const buildPluginManager = createSentryBuildPluginManager(
      {
        org: "test-org",
        project: "test-project",
        authToken: "test-token",
        release: {
          name: "test-release",
          uploadLegacySourcemaps: path.join(tempDir, "dist/*.js"),
        },
      },
      {
        buildTool: "webpack",
        loggerPrefix: "[sentry-webpack-plugin]",
      }
    );

    await buildPluginManager.createRelease();

    expect(mockCliInstance.releases.uploadSourceMaps).toHaveBeenCalledTimes(1);

    const uploadCalls = mockCliInstance.releases.uploadSourceMaps.mock.calls;
    expect(uploadCalls).toHaveLength(1);

    const uploadCall = uploadCalls[0];
    expect(uploadCall).toHaveLength(2);

    // TS yelling at me
    if (!uploadCall) {
      throw new Error("uploadCall should be defined");
    }

    const uploadOptions = uploadCall[1];
    const firstInclude = uploadOptions.include[0];

    if (!firstInclude) {
      throw new Error("firstInclude should be defined");
    }

    const includePaths = firstInclude.paths;
    expect(includePaths).toHaveLength(2);
    expect(includePaths.some((p: string) => p.includes("beep.js"))).toBe(true);
    expect(includePaths.some((p: string) => p.includes("boop.js"))).toBe(true);
  });

  it("should expand multiple glob patterns and mixed path types", async () => {
    const additionalFiles = [
      "src/app.js",
      "src/app.js.map",
      "dist/vendor.bundle",
      "dist/vendor.bundle.map",
      "assets/styles.css",
      "static/image.png",
    ];

    for (const file of additionalFiles) {
      const fullPath = path.join(tempDir, file);
      await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.promises.writeFile(fullPath, "additional content");
    }

    const buildPluginManager = createSentryBuildPluginManager(
      {
        org: "test-org",
        project: "test-project",
        authToken: "test-token",
        release: {
          name: "test-release",
          uploadLegacySourcemaps: [
            path.join(tempDir, "dist/*"),
            path.join(tempDir, "src", "app.js"),
            path.join(tempDir, "assets/*"),
          ],
        },
      },
      {
        buildTool: "webpack",
        loggerPrefix: "[sentry-webpack-plugin]",
      }
    );

    await buildPluginManager.createRelease();

    expect(mockCliInstance.releases.uploadSourceMaps).toHaveBeenCalledTimes(1);

    const uploadCalls = mockCliInstance.releases.uploadSourceMaps.mock.calls;
    expect(uploadCalls).toHaveLength(1);

    const uploadCall = uploadCalls[0];
    expect(uploadCall).toHaveLength(2);

    if (!uploadCall) {
      throw new Error("uploadCall should be defined");
    }

    const uploadOptions = uploadCall[1];
    expect(uploadOptions.include).toHaveLength(3);

    // Should match all files in dist/
    const firstInclude = uploadOptions.include[0];
    if (!firstInclude) {
      throw new Error("firstInclude should be defined");
    }

    const firstIncludePaths = firstInclude.paths;
    expect(firstIncludePaths).toHaveLength(4); // beep.js, boop.js, vendor.bundle, vendor.bundle.map
    expect(firstIncludePaths.some((p: string) => p.includes("beep.js"))).toBe(true);
    expect(firstIncludePaths.some((p: string) => p.includes("boop.js"))).toBe(true);
    expect(firstIncludePaths.some((p: string) => p.includes("vendor.bundle"))).toBe(true);
    expect(firstIncludePaths.some((p: string) => p.includes("vendor.bundle.map"))).toBe(true);

    // Should match the specific file
    const secondInclude = uploadOptions.include[1];
    if (!secondInclude) {
      throw new Error("secondInclude should be defined");
    }

    const secondIncludePaths = secondInclude.paths;
    expect(secondIncludePaths).toHaveLength(1);
    expect(secondIncludePaths[0]).toContain("app.js");

    // Should match files in assets/
    const thirdInclude = uploadOptions.include[2];
    if (!thirdInclude) {
      throw new Error("thirdInclude should be defined");
    }

    const thirdIncludePaths = thirdInclude.paths;
    expect(thirdIncludePaths).toHaveLength(1);
    expect(thirdIncludePaths[0]).toContain("styles.css");

    // Should have the correct default extension filter
    expect(firstInclude.ext).toEqual([".js", ".map", ".jsbundle", ".bundle"]);
    expect(secondInclude.ext).toEqual([".js", ".map", ".jsbundle", ".bundle"]);
    expect(thirdInclude.ext).toEqual([".js", ".map", ".jsbundle", ".bundle"]);
  });

  it("should apply custom file extensions when specified", async () => {
    const testFiles = ["dist/main.js", "dist/main.js.map", "dist/styles.css", "dist/data.json"];

    for (const file of testFiles) {
      const fullPath = path.join(tempDir, file);
      await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.promises.writeFile(fullPath, "test content");
    }

    const buildPluginManager = createSentryBuildPluginManager(
      {
        org: "test-org",
        project: "test-project",
        authToken: "test-token",
        release: {
          name: "test-release",
          uploadLegacySourcemaps: {
            paths: [path.join(tempDir, "dist/*")],
            ext: ["js", "css"],
          },
        },
      },
      {
        buildTool: "webpack",
        loggerPrefix: "[sentry-webpack-plugin]",
      }
    );

    await buildPluginManager.createRelease();

    expect(mockCliInstance.releases.uploadSourceMaps).toHaveBeenCalledTimes(1);

    const uploadCalls = mockCliInstance.releases.uploadSourceMaps.mock.calls;
    const uploadCall = uploadCalls[0];

    if (!uploadCall) {
      throw new Error("uploadCall should be defined");
    }

    const uploadOptions = uploadCall[1];
    const firstInclude = uploadOptions.include[0];

    if (!firstInclude) {
      throw new Error("firstInclude should be defined");
    }

    const includePaths = firstInclude.paths;

    expect(includePaths).toHaveLength(6);
    expect(includePaths.some((p: string) => p.includes("main.js"))).toBe(true);
    expect(includePaths.some((p: string) => p.includes("main.js.map"))).toBe(true);
    expect(includePaths.some((p: string) => p.includes("styles.css"))).toBe(true);
    expect(includePaths.some((p: string) => p.includes("data.json"))).toBe(true);
    expect(includePaths.some((p: string) => p.includes("beep.js"))).toBe(true);
    expect(includePaths.some((p: string) => p.includes("boop.js"))).toBe(true);
    expect(firstInclude.ext).toEqual([".js", ".css"]); // Custom extensions added
  });
});
