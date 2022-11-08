import { InternalOptions } from "../src/options-mapping";
import { setCommits } from "../src/sentry/releasePipeline";
import { BuildContext } from "../src/types";

const mockedAddSpanToTxn = jest.fn();

jest.mock("../src/sentry/telemetry", () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const original = jest.requireActual("../src/sentry/telemetry");

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...original,
    addSpanToTransaction: () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return mockedAddSpanToTxn();
    },
  };
});

describe("Release Pipeline", () => {
  const mockedLogger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  const mockedCLI = {
    releases: {
      setCommits: jest.fn(),
    },
  };

  const mockedChildSpan = { finish: jest.fn() };
  mockedAddSpanToTxn.mockImplementation(() => mockedChildSpan);

  const ctx = { cli: mockedCLI, logger: mockedLogger };

  describe("setCommits", () => {
    it("doesn't do anything if setCommits option is not specified", async () => {
      await setCommits({} as InternalOptions, ctx as unknown as BuildContext);

      expect(mockedCLI.releases.setCommits).not.toHaveBeenCalled();
      expect(mockedAddSpanToTxn).toHaveBeenCalled();
      expect(mockedChildSpan.finish).toHaveBeenCalled();
    });

    it("logs an error if neither `auto` nor `repo` && `commit` options are specified", async () => {
      await setCommits({ setCommits: {} } as InternalOptions, ctx as unknown as BuildContext);
      expect(mockedCLI.releases.setCommits).not.toHaveBeenCalled();
      expect(mockedLogger.error).toHaveBeenLastCalledWith(
        expect.stringMatching(/Couldn't set commits.*auto.*repo.*commit/),
        expect.stringMatching(/.*auto.*repo.*commit/)
      );
      expect(mockedAddSpanToTxn).toHaveBeenCalled();
      expect(mockedChildSpan.finish).toHaveBeenCalled();
    });

    it("makes a call to Sentry CLI if the correct options are specified", async () => {
      await setCommits(
        { setCommits: { auto: true }, release: "1.0.0" } as InternalOptions,
        ctx as unknown as BuildContext
      );

      expect(mockedCLI.releases.setCommits).toHaveBeenCalledWith("1.0.0", { auto: true });
      expect(mockedAddSpanToTxn).toHaveBeenCalled();
      expect(mockedChildSpan.finish).toHaveBeenCalled();
    });
  });
});
