import { Hub } from "@sentry/node";
import { NormalizedOptions, normalizeUserOptions } from "../../src/options-mapping";
import { allowedToSendTelemetry, setTelemetryDataOnHub } from "../../src/sentry/telemetry";

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

describe("addPluginOptionTagsToHub", () => {
  const mockedHub = {
    setTag: jest.fn(),
    setTags: jest.fn(),
    setUser: jest.fn(),
  };

  const defaultOptions = {
    release: { uploadlegacySourcemaps: [] },
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should set include tag according to number of entries (single entry)", () => {
    setTelemetryDataOnHub(
      normalizeUserOptions(defaultOptions),
      mockedHub as unknown as Hub,
      "rollup"
    );
    expect(mockedHub.setTag).toHaveBeenCalledWith("uploadlegacySourcemapsEntries", 0);
  });

  it("should set include tag according to number of entries (multiple entries)", () => {
    setTelemetryDataOnHub(
      normalizeUserOptions({ release: { uploadlegacySourcemaps: ["", "", ""] } }),
      mockedHub as unknown as Hub,
      "rollup"
    );
    expect(mockedHub.setTag).toHaveBeenCalledWith("uploadlegacySourcemapsEntries", 3);
  });

  it("should set deploy tag to true if the deploy option is specified", () => {
    setTelemetryDataOnHub(
      normalizeUserOptions({ ...defaultOptions, release: { deploy: { env: "production" } } }),
      mockedHub as unknown as Hub,
      "rollup"
    );
    expect(mockedHub.setTag).toHaveBeenCalledWith("add-deploy", true);
  });

  it("should set errorHandler tag to `custom` if the errorHandler option is specified", () => {
    setTelemetryDataOnHub(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      normalizeUserOptions({ ...defaultOptions, errorHandler: () => {} }),
      mockedHub as unknown as Hub,
      "rollup"
    );
    expect(mockedHub.setTag).toHaveBeenCalledWith("error-handler", "custom");
  });

  it.each([
    ["auto", { auto: true }],
    ["manual", { repo: "", commit: "" }],
  ])(
    `should set setCommits tag to %s if the setCommits option is %s`,
    (expectedValue, commitOptions) => {
      setTelemetryDataOnHub(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        normalizeUserOptions({ ...defaultOptions, release: { setCommits: commitOptions as any } }),
        mockedHub as unknown as Hub,
        "rollup"
      );
      expect(mockedHub.setTag).toHaveBeenCalledWith("set-commits", expectedValue);
    }
  );

  it("sets all simple tags correctly", () => {
    setTelemetryDataOnHub(
      normalizeUserOptions({
        ...defaultOptions,
        release: {
          cleanArtifacts: true,
          finalize: true,
        },
      }),
      mockedHub as unknown as Hub,
      "rollup"
    );

    expect(mockedHub.setTag).toHaveBeenCalledWith("clean-artifacts", true);
    expect(mockedHub.setTag).toHaveBeenCalledWith("finalize-release", true);
  });

  it("shouldn't set any tags other than include if no opional options are specified", () => {
    setTelemetryDataOnHub(
      normalizeUserOptions(defaultOptions),
      mockedHub as unknown as Hub,
      "rollup"
    );

    expect(mockedHub.setTag).toHaveBeenCalledWith("uploadlegacySourcemapsEntries", 0);
    expect(mockedHub.setTag).toHaveBeenCalledWith("finalize-release", true);
    expect(mockedHub.setTag).toHaveBeenCalledWith("node", expect.any(String));
  });
});
