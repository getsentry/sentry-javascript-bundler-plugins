import { Hub } from "@sentry/node";
import { InternalOptions } from "../../src/options-mapping";
import { SentryCLILike } from "../../src/sentry/cli";
import {
  addPluginOptionTags,
  captureMinimalError,
  turnOffTelemetryForSelfHostedSentry,
} from "../../src/sentry/telemetry";

describe("turnOffTelemetryForSelfHostedSentry", () => {
  const mockedCLI = {
    execute: jest
      .fn()
      .mockImplementation(() => "Sentry Server: https://sentry.io  \nsomeotherstuff\netc"),
  };

  const options = {
    enabled: true,
    tracesSampleRate: 1.0,
    sampleRate: 1.0,
  };

  const mockedClient = {
    getOptions: jest.fn().mockImplementation(() => options),
  };
  const mockedHub = {
    getClient: jest.fn().mockImplementation(() => {
      return mockedClient;
    }),
  };

  afterEach(() => {
    jest.resetAllMocks();
    mockedCLI.execute.mockImplementation(
      () => "Sentry Server: https://sentry.io  \nsomeotherstuff\netc"
    );
  });

  it("Should turn telemetry off if CLI returns a URL other than sentry.io", async () => {
    mockedCLI.execute.mockImplementation(
      () => "Sentry Server: https://selfhostedSentry.io  \nsomeotherstuff\netc"
    );
    await turnOffTelemetryForSelfHostedSentry(
      mockedCLI as unknown as SentryCLILike,
      mockedHub as unknown as Hub
    );
    expect(mockedHub.getClient).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(mockedHub.getClient().getOptions).toHaveBeenCalledTimes(3);
  });

  it("Should do nothing if CLI returns sentry.io as a URL", async () => {
    await turnOffTelemetryForSelfHostedSentry(
      mockedCLI as unknown as SentryCLILike,
      mockedHub as unknown as Hub
    );
    expect(mockedHub.getClient).not.toHaveBeenCalled();
  });
});

describe("captureMinimalError", () => {
  const mockedHub = {
    captureException: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("Should capture a normal error", () => {
    captureMinimalError(new Error("test"), mockedHub as unknown as Hub);
    expect(mockedHub.captureException).toHaveBeenCalledWith({
      name: "Error",
      message: "test",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      stack: expect.any(String),
    });
  });

  it("Shouldn't capture an error with additional data", () => {
    const error = new Error("test");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (error as any).additionalContext = { foo: "bar" };

    captureMinimalError(error, mockedHub as unknown as Hub);

    expect(mockedHub.captureException).toHaveBeenCalledWith({
      name: "Error",
      message: "test",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      stack: expect.any(String),
    });
  });

  it("Should handle string messages gracefully", () => {
    const error = "Property x is missing!";

    captureMinimalError(error, mockedHub as unknown as Hub);

    expect(mockedHub.captureException).toHaveBeenCalledWith({
      name: "Error",
      message: error,
    });
  });

  it("Should even handle undefined gracefully", () => {
    const error = undefined;

    captureMinimalError(error, mockedHub as unknown as Hub);

    expect(mockedHub.captureException).toHaveBeenCalledWith({
      name: "Error",
      message: "undefined",
    });
  });
});

describe("addPluginOptionTags", () => {
  const mockedHub = {
    setTag: jest.fn(),
  };

  const defaultOptions: Partial<InternalOptions> = {
    include: [],
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should set include tag according to number of entries (single entry)", () => {
    addPluginOptionTags(defaultOptions as unknown as InternalOptions, mockedHub as unknown as Hub);
    expect(mockedHub.setTag).toHaveBeenCalledWith("include", "single-entry");
  });
  it("should set include tag according to number of entries (multiple entries)", () => {
    addPluginOptionTags(
      { include: [{}, {}, {}] } as unknown as InternalOptions,
      mockedHub as unknown as Hub
    );
    expect(mockedHub.setTag).toHaveBeenCalledWith("include", "multiple-entries");
  });

  it("should set deploy tag to true if the deploy option is specified", () => {
    addPluginOptionTags(
      { ...defaultOptions, deploy: { env: "production" } } as unknown as InternalOptions,
      mockedHub as unknown as Hub
    );
    expect(mockedHub.setTag).toHaveBeenCalledWith("add-deploy", true);
  });

  it("should set errorHandler tag to `custom` if the errorHandler option is specified", () => {
    addPluginOptionTags(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      { ...defaultOptions, errorHandler: () => {} } as unknown as InternalOptions,
      mockedHub as unknown as Hub
    );
    expect(mockedHub.setTag).toHaveBeenCalledWith("error-handler", "custom");
  });

  it.each([
    ["auto", { auto: true }],
    ["manual", { repo: "", commit: "" }],
  ])(
    `should set setCommits tag to %s if the setCommits option is %s`,
    (expectedValue, commitOptions) => {
      addPluginOptionTags(
        { ...defaultOptions, setCommits: commitOptions } as unknown as InternalOptions,
        mockedHub as unknown as Hub
      );
      expect(mockedHub.setTag).toHaveBeenCalledWith("set-commits", expectedValue);
    }
  );

  it("sets all simple tags correctly", () => {
    addPluginOptionTags(
      {
        ...defaultOptions,
        cleanArtifacts: true,
        finalize: true,
        injectReleasesMap: true,
        dryRun: true,
      } as unknown as InternalOptions,
      mockedHub as unknown as Hub
    );

    expect(mockedHub.setTag).toHaveBeenCalledWith("clean-artifacts", true);
    expect(mockedHub.setTag).toHaveBeenCalledWith("finalize-release", true);
    expect(mockedHub.setTag).toHaveBeenCalledWith("inject-releases-map", true);
    expect(mockedHub.setTag).toHaveBeenCalledWith("dry-run", true);
  });

  it("shouldn't set any tags other than include if no opional options are specified", () => {
    addPluginOptionTags(defaultOptions as unknown as InternalOptions, mockedHub as unknown as Hub);
    expect(mockedHub.setTag).toHaveBeenCalledTimes(2);
    expect(mockedHub.setTag).toHaveBeenCalledWith("include", "single-entry");
    expect(mockedHub.setTag).toHaveBeenCalledWith("node", expect.any(String));
  });
});
