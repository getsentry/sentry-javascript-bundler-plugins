import { Hub } from "@sentry/node";
import { InternalOptions } from "../../src/options-mapping";
import { addPluginOptionTags, captureMinimalError } from "../../src/sentry/telemetry";

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
    expect(mockedHub.setTag).toHaveBeenCalledTimes(1);
    expect(mockedHub.setTag).toHaveBeenCalledWith("include", "single-entry");
  });
});
