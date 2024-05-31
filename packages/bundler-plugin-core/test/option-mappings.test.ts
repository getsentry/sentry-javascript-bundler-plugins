import { Options } from "../src";
import { NormalizedOptions, normalizeUserOptions, validateOptions } from "../src/options-mapping";

describe("normalizeUserOptions()", () => {
  test("should return correct value for default input", () => {
    const userOptions: Options = {
      org: "my-org",
      project: "my-project",
      authToken: "my-auth-token",
      release: { name: "my-release", uploadLegacySourcemaps: "./out" }, // we have to define this even though it is an optional value because of auto discovery
    };

    expect(normalizeUserOptions(userOptions)).toEqual({
      authToken: "my-auth-token",
      org: "my-org",
      project: "my-project",
      debug: false,
      disable: false,
      release: {
        name: "my-release",
        finalize: true,
        inject: true,
        create: true,
        vcsRemote: "origin",
        uploadLegacySourcemaps: "./out",
      },
      silent: false,
      telemetry: true,
      _experiments: {},
      _metaOptions: {
        telemetry: {
          metaFramework: undefined,
        },
      },
      url: "https://sentry.io",
    });
  });

  test("should hoist top-level include options into include entries", () => {
    const userOptions: Options = {
      org: "my-org",
      project: "my-project",
      authToken: "my-auth-token",
      release: {
        name: "my-release", // we have to define this even though it is an optional value because of auto discovery
        uploadLegacySourcemaps: {
          paths: ["./output", "./files"],
          ignore: ["./files"],
          rewrite: true,
          sourceMapReference: false,
          stripCommonPrefix: true,
          ext: ["js", "map", ".foo"],
        },
      },
    };

    expect(normalizeUserOptions(userOptions)).toEqual({
      authToken: "my-auth-token",
      org: "my-org",
      project: "my-project",
      debug: false,
      disable: false,
      release: {
        name: "my-release",
        vcsRemote: "origin",
        finalize: true,
        create: true,
        inject: true,
        uploadLegacySourcemaps: {
          ext: ["js", "map", ".foo"],
          ignore: ["./files"],
          paths: ["./output", "./files"],
          rewrite: true,
          sourceMapReference: false,
          stripCommonPrefix: true,
        },
      },
      silent: false,
      telemetry: true,
      _experiments: {},
      _metaOptions: {
        telemetry: {
          metaFramework: undefined,
        },
      },
      url: "https://sentry.io",
    });
  });

  test.each(["https://sentry.io", undefined])(
    "should enable telemetry if `telemetry` is true and Sentry SaaS URL (%s) is used",
    (url) => {
      const options = {
        include: "",
        url,
      };

      expect(normalizeUserOptions(options).telemetry).toBe(true);
    }
  );
});

describe("validateOptions", () => {
  const mockedLogger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should return `true` if `injectRelease` is `true` and org is provided", () => {
    const options = { injectReleasesMap: true, org: "my-org" } as Partial<NormalizedOptions>;

    expect(validateOptions(options as unknown as NormalizedOptions, mockedLogger)).toBe(true);
    expect(mockedLogger.error).not.toHaveBeenCalled();
  });

  it("should return `false` if `setCommits` is set but neither auto nor manual options are set", () => {
    const options = { release: { setCommits: {} } } as Partial<NormalizedOptions>;

    expect(validateOptions(options as unknown as NormalizedOptions, mockedLogger)).toBe(false);
    expect(mockedLogger.error).toHaveBeenCalledWith(
      expect.stringMatching(/setCommits.*missing.*properties/),
      expect.stringMatching(/set.*either.*auto.*repo.*commit/)
    );
  });

  it("should return `true` but warn if `setCommits` is set and both auto nor manual options are set", () => {
    const options = { release: { setCommits: { auto: true, repo: "myRepo", commit: "myCommit" } } };

    expect(validateOptions(options as unknown as NormalizedOptions, mockedLogger)).toBe(true);
    expect(mockedLogger.error).not.toHaveBeenCalled();
    expect(mockedLogger.warn).toHaveBeenCalledWith(
      expect.stringMatching(/setCommits.*auto.*repo.*commit/),
      expect.stringMatching(/Ignoring.*repo.*commit/),
      expect.stringMatching(/set.*either.*auto.*repo.*commit/)
    );
  });

  it("should return `false` if `deploy`is set but `env` is not provided", () => {
    const options = { release: { deploy: {} } } as Partial<NormalizedOptions>;

    expect(validateOptions(options as unknown as NormalizedOptions, mockedLogger)).toBe(false);
    expect(mockedLogger.error).toHaveBeenCalledWith(
      expect.stringMatching(/deploy.*missing.*property/),
      expect.stringMatching(/set.*env/)
    );
  });

  it("should return `true` if `deploy`is set and `env` is provided", () => {
    const options = { deploy: { env: "my-env" } } as Partial<NormalizedOptions>;

    expect(validateOptions(options as unknown as NormalizedOptions, mockedLogger)).toBe(true);
    expect(mockedLogger.error).not.toHaveBeenCalled();
  });

  it("should return `true` for options without special cases", () => {
    const options = {
      org: "my-org",
      project: "my-project",
      authToken: "my-auth-token",
      include: [{}],
      finalize: true,
    } as Partial<NormalizedOptions>;

    expect(validateOptions(options as unknown as NormalizedOptions, mockedLogger)).toBe(true);
    expect(mockedLogger.error).not.toHaveBeenCalled();
  });
});
