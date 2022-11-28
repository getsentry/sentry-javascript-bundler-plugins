import { Hub } from "@sentry/node";
import { InternalOptions } from "../../src/options-mapping";
import { addPluginOptionInformationToHub, shouldSendTelemetry } from "../../src/sentry/telemetry";

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
    expect(await shouldSendTelemetry({} as InternalOptions)).toBe(false);
  });

  it("should return true if CLI returns sentry.io as a URL", async () => {
    mockCliExecute.mockImplementation(
      () => "Sentry Server: https://sentry.io  \nsomeotherstuff\netc"
    );
    expect(await shouldSendTelemetry({} as InternalOptions)).toBe(true);
  });
});

describe("addPluginOptionTagsToHub", () => {
  const mockedHub = {
    setTag: jest.fn(),
    setTags: jest.fn(),
    setUser: jest.fn(),
  };

  const defaultOptions: Partial<InternalOptions> = {
    include: [],
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should set include tag according to number of entries (single entry)", () => {
    addPluginOptionInformationToHub(
      defaultOptions as unknown as InternalOptions,
      mockedHub as unknown as Hub,
      "rollup"
    );
    expect(mockedHub.setTag).toHaveBeenCalledWith("include", "single-entry");
  });

  it("should set include tag according to number of entries (multiple entries)", () => {
    addPluginOptionInformationToHub(
      { include: [{}, {}, {}] } as unknown as InternalOptions,
      mockedHub as unknown as Hub,
      "rollup"
    );
    expect(mockedHub.setTag).toHaveBeenCalledWith("include", "multiple-entries");
  });

  it("should set deploy tag to true if the deploy option is specified", () => {
    addPluginOptionInformationToHub(
      { ...defaultOptions, deploy: { env: "production" } } as unknown as InternalOptions,
      mockedHub as unknown as Hub,
      "rollup"
    );
    expect(mockedHub.setTag).toHaveBeenCalledWith("add-deploy", true);
  });

  it("should set errorHandler tag to `custom` if the errorHandler option is specified", () => {
    addPluginOptionInformationToHub(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      { ...defaultOptions, errorHandler: () => {} } as unknown as InternalOptions,
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
      addPluginOptionInformationToHub(
        { ...defaultOptions, setCommits: commitOptions } as unknown as InternalOptions,
        mockedHub as unknown as Hub,
        "rollup"
      );
      expect(mockedHub.setTag).toHaveBeenCalledWith("set-commits", expectedValue);
    }
  );

  it("sets all simple tags correctly", () => {
    addPluginOptionInformationToHub(
      {
        ...defaultOptions,
        cleanArtifacts: true,
        finalize: true,
        injectReleasesMap: true,
        dryRun: true,
      } as unknown as InternalOptions,
      mockedHub as unknown as Hub,
      "rollup"
    );

    expect(mockedHub.setTag).toHaveBeenCalledWith("clean-artifacts", true);
    expect(mockedHub.setTag).toHaveBeenCalledWith("finalize-release", true);
    expect(mockedHub.setTag).toHaveBeenCalledWith("inject-releases-map", true);
    expect(mockedHub.setTag).toHaveBeenCalledWith("dry-run", true);
  });

  it("shouldn't set any tags other than include if no opional options are specified", () => {
    addPluginOptionInformationToHub(
      defaultOptions as unknown as InternalOptions,
      mockedHub as unknown as Hub,
      "rollup"
    );
    expect(mockedHub.setTag).toHaveBeenCalledTimes(2);
    expect(mockedHub.setTag).toHaveBeenCalledWith("include", "single-entry");
    expect(mockedHub.setTag).toHaveBeenCalledWith("node", expect.any(String));
  });
});
