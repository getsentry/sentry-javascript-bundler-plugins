import { Scope } from "@sentry/core";
import { NormalizedOptions, normalizeUserOptions } from "../../src/options-mapping";
import { allowedToSendTelemetry, setTelemetryDataOnScope } from "../../src/sentry/telemetry";

const mockCliExecute = jest.fn();
jest.mock(
  "@sentry/cli",
  () =>
    class {
      execute = mockCliExecute;
    }
);

describe("shouldSendTelemetry", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should return false if CLI returns a URL other than sentry.io", async () => {
    mockCliExecute.mockImplementation(
      () => "Sentry Server: https://selfhostedSentry.io  \nsomeotherstuff\netc"
    );
    expect(await allowedToSendTelemetry({ release: {} } as NormalizedOptions)).toBe(false);
  });

  it("should return true if CLI returns sentry.io as a URL", async () => {
    mockCliExecute.mockImplementation(
      () => "Sentry Server: https://sentry.io  \nsomeotherstuff\netc"
    );
    expect(await allowedToSendTelemetry({ release: {} } as NormalizedOptions)).toBe(true);
  });
});

describe("addPluginOptionTagsToScope", () => {
  const mockedScope = {
    setTag: jest.fn(),
    setTags: jest.fn(),
    setUser: jest.fn(),
  };

  const defaultOptions = {
    release: { uploadLegacySourcemaps: [] },
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should set include tag according to number of entries (single entry)", () => {
    setTelemetryDataOnScope(
      normalizeUserOptions(defaultOptions),
      mockedScope as unknown as Scope,
      "rollup"
    );
    expect(mockedScope.setTag).toHaveBeenCalledWith("uploadLegacySourcemapsEntries", 0);
  });

  it("should set include tag according to number of entries (multiple entries)", () => {
    setTelemetryDataOnScope(
      normalizeUserOptions({ release: { uploadLegacySourcemaps: ["", "", ""] } }),
      mockedScope as unknown as Scope,
      "rollup"
    );
    expect(mockedScope.setTag).toHaveBeenCalledWith("uploadLegacySourcemapsEntries", 3);
  });

  it("should set deploy tag to true if the deploy option is specified", () => {
    setTelemetryDataOnScope(
      normalizeUserOptions({ ...defaultOptions, release: { deploy: { env: "production" } } }),
      mockedScope as unknown as Scope,
      "rollup"
    );
    expect(mockedScope.setTag).toHaveBeenCalledWith("deploy-options", true);
  });

  it("should set errorHandler tag to `custom` if the errorHandler option is specified", () => {
    setTelemetryDataOnScope(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      normalizeUserOptions({ ...defaultOptions, errorHandler: () => {} }),
      mockedScope as unknown as Scope,
      "rollup"
    );
    expect(mockedScope.setTag).toHaveBeenCalledWith("custom-error-handler", true);
  });

  it.each([
    ["auto", { auto: true }],
    ["manual", { repo: "", commit: "" }],
  ])(
    `should set setCommits tag to %s if the setCommits option is %s`,
    (expectedValue, commitOptions) => {
      setTelemetryDataOnScope(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
        normalizeUserOptions({ ...defaultOptions, release: { setCommits: commitOptions as any } }),
        mockedScope as unknown as Scope,
        "rollup"
      );
      expect(mockedScope.setTag).toHaveBeenCalledWith("set-commits", expectedValue);
    }
  );

  it("sets all simple tags correctly", () => {
    setTelemetryDataOnScope(
      normalizeUserOptions({
        ...defaultOptions,
        release: {
          finalize: true,
        },
      }),
      mockedScope as unknown as Scope,
      "rollup"
    );

    expect(mockedScope.setTag).toHaveBeenCalledWith("finalize-release", true);
  });

  it("shouldn't set any tags other than include if no opional options are specified", () => {
    setTelemetryDataOnScope(
      normalizeUserOptions(defaultOptions),
      mockedScope as unknown as Scope,
      "rollup"
    );

    expect(mockedScope.setTag).toHaveBeenCalledWith("uploadLegacySourcemapsEntries", 0);
    expect(mockedScope.setTag).toHaveBeenCalledWith("finalize-release", true);
    expect(mockedScope.setTag).toHaveBeenCalledWith("node", expect.any(String));
  });
});
