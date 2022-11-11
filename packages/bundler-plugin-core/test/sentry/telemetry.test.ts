import { Hub } from "@sentry/node";
import { captureMinimalError } from "../../src/sentry/telemetry";

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
