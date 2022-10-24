import { detectRelease } from "../src/detect-release";
import * as fs from "fs";
import * as child_process from "child_process";
jest.mock("fs");
jest.mock("child_process");

const mockedFs = fs;
const mockedChildProcess = child_process;

describe("environmental getReleaseName", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    (mockedChildProcess.execSync as jest.Mock).mockRestore();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("adheres to HEAD when git is present", () => {
    (mockedFs.existsSync as jest.Mock).mockReturnValueOnce(true);
    const sha = "c3f235fc86f1c4007e3a218ec82d666586e73cbf";
    (mockedChildProcess.execSync as jest.Mock).mockReturnValue(sha);

    expect(detectRelease()).toBe(sha);
  });

  it("throws an error if no release information could be found", () => {
    (mockedFs.existsSync as jest.Mock).mockReturnValueOnce(false);

    expect(detectRelease).toThrow(
      'Could not automatically determine release name. Please provide a release identifier via the "release" option.'
    );
  });

  it("adheres to process.env.SENTRY_RELEASE", () => {
    const releaseName = "SENTRY_RELEASE_string";
    process.env["SENTRY_RELEASE"] = releaseName;

    expect(detectRelease()).toBe(releaseName);
  });

  it("adheres to Heroku: process.env.SOURCE_VERSION", () => {
    const releaseName = "SOURCE_VERSION_string";
    process.env["SOURCE_VERSION"] = releaseName;

    expect(detectRelease()).toBe(releaseName);
  });

  it("adheres to Heroku: process.env.HEROKU_SLUG_COMMIT", () => {
    const releaseName = "HEROKU_SLUG_COMMIT_string";
    process.env["HEROKU_SLUG_COMMIT"] = releaseName;

    expect(detectRelease()).toBe(releaseName);
  });

  it("adheres to AWS: process.env.CODEBUILD_RESOLVED_SOURCE_VERSION", () => {
    const releaseName = "CODEBUILD_RESOLVED_SOURCE_VERSION_string";
    process.env["CODEBUILD_RESOLVED_SOURCE_VERSION"] = releaseName;

    expect(detectRelease()).toBe(releaseName);
  });

  it("adheres to Vercel: process.env.VERCEL_GIT_COMMIT_SHA", () => {
    const releaseName = "VERCEL_GIT_COMMIT_SHA_string";
    process.env["VERCEL_GIT_COMMIT_SHA"] = releaseName;

    expect(detectRelease()).toBe(releaseName);
  });

  it("allows SENTRY_RELEASE to take precedence over other env vars", () => {
    const vercelReleaseName = "VERCEL_GIT_COMMIT_SHA_string";
    const sentryReleaseName = "SENTRY_RELEASE_string";
    process.env["VERCEL_GIT_COMMIT_SHA"] = vercelReleaseName;
    process.env["SENTRY_RELEASE"] = sentryReleaseName;

    expect(detectRelease()).toBe(sentryReleaseName);
  });
});
