import SentryCli from "@sentry/cli";
import { getSentryCli } from "../../src/sentry/cli";

describe("getSentryCLI", () => {
  it("returns a valid CLI instance if dryRun is not specified", () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    const cli = getSentryCli({} as any, {} as any);
    expect(cli).toBeInstanceOf(SentryCli);
  });

  it("returns a dry run CLI stub if `dryRun` is set to true", () => {
    const logger = { info: jest.fn() };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    const cli = getSentryCli({ dryRun: true } as any, logger as any);
    expect(logger.info).toHaveBeenCalledWith(expect.stringMatching("DRY RUN"));
    expect(cli).not.toBeInstanceOf(SentryCli);
  });
});
