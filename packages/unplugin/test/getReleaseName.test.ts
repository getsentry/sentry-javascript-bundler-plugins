import { getReleaseName } from "../src/getReleaseName";
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

    expect(getReleaseName()).toBe(sha);
  });

  it("throws an error if no release information could be found", () => {
    (mockedFs.existsSync as jest.Mock).mockReturnValueOnce(false);

    expect(getReleaseName).toThrow("Could not return a release name");
  });

  it("adheres to user defined release name", () => {
    const releaseName = "USER_DEFINED_this-is-my-custom-release";

    expect(getReleaseName(releaseName)).toBe(releaseName);
  });

  it("adheres to process.env.SENTRY_RELEASE", () => {
    const releaseName = "SENTRY_RELEASE_string";
    process.env["SENTRY_RELEASE"] = releaseName;

    expect(getReleaseName()).toBe(releaseName);
  });

  it("adheres to Heroku: process.env.SOURCE_VERSION", () => {
    const releaseName = "SOURCE_VERSION_string";
    process.env["SOURCE_VERSION"] = releaseName;

    expect(getReleaseName()).toBe(releaseName);
  });

  it("adheres to Heroku: process.env.HEROKU_SLUG_COMMIT", () => {
    const releaseName = "HEROKU_SLUG_COMMIT_string";
    process.env["HEROKU_SLUG_COMMIT"] = releaseName;

    expect(getReleaseName()).toBe(releaseName);
  });

  it("adheres to AWS: process.env.CODEBUILD_RESOLVED_SOURCE_VERSION", () => {
    const releaseName = "CODEBUILD_RESOLVED_SOURCE_VERSION_string";
    process.env["CODEBUILD_RESOLVED_SOURCE_VERSION"] = releaseName;

    expect(getReleaseName()).toBe(releaseName);
  });

  it("adheres to Vercel: process.env.VERCEL_GIT_COMMIT_SHA", () => {
    const releaseName = "VERCEL_GIT_COMMIT_SHA_string";
    process.env["VERCEL_GIT_COMMIT_SHA"] = releaseName;

    expect(getReleaseName()).toBe(releaseName);
  });

  it("allows SENTRY_RELEASE to take precedence over other env vars", () => {
    const vercelReleaseName = "VERCEL_GIT_COMMIT_SHA_string";
    const sentryReleaseName = "SENTRY_RELEASE_string";
    process.env["VERCEL_GIT_COMMIT_SHA"] = vercelReleaseName;
    process.env["SENTRY_RELEASE"] = sentryReleaseName;

    expect(getReleaseName()).toBe(sentryReleaseName);
  });

  it("allows custom release name to take precedence over other env vars", () => {
    const vercelReleaseName = "VERCEL_GIT_COMMIT_SHA_string";
    const sentryReleaseName = "SENTRY_RELEASE_string";
    process.env["VERCEL_GIT_COMMIT_SHA"] = vercelReleaseName;
    process.env["SENTRY_RELEASE"] = sentryReleaseName;

    expect(getReleaseName("cutom_release_name")).toBe("cutom_release_name");
  });
});
