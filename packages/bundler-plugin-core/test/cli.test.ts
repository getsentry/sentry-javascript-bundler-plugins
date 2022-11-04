import SentryCli from "@sentry/cli";
import { getSentryCli } from "../src/sentry/cli";

describe("getSentryCLI", () => {
  it("returns a valid CLI instance if dryRun is not specified", () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    const cli = getSentryCli({} as any, {} as any);
    expect(cli).toBeInstanceOf(SentryCli);
  });

  it("returns a valid CLI instance if dryRun is set to true", () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    const cli = getSentryCli({ dryRun: true } as any, {} as any);
    expect(cli).not.toBeInstanceOf(SentryCli);
  });
});
