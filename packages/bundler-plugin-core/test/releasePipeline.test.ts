import { InternalOptions } from "../src/options-mapping";
import {
  addDeploy,
  cleanArtifacts,
  createNewRelease,
  finalizeRelease,
  setCommits,
  uploadSourceMaps,
} from "../src/sentry/releasePipeline";
import { BuildContext } from "../src/types";

const mockedAddSpanToTxn = jest.fn();

jest.mock("../src/sentry/telemetry", () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const original = jest.requireActual("../src/sentry/telemetry");

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...original,
    addSpanToTransaction: (ctx: unknown, op: string) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return mockedAddSpanToTxn(ctx, op);
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
      new: jest.fn(),
      execute: jest.fn(),
      uploadSourceMaps: jest.fn(),
      setCommits: jest.fn(),
      finalize: jest.fn(),
      newDeploy: jest.fn(),
    },
  };

  const mockedChildSpan = { finish: jest.fn() };
  mockedAddSpanToTxn.mockImplementation(() => mockedChildSpan);

  const ctx = { cli: mockedCLI, logger: mockedLogger };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createNewRelease", () => {
    it("makes a call to Sentry CLI's releases creation command", async () => {
      await createNewRelease(
        { release: "1.0.0" } as InternalOptions,
        ctx as unknown as BuildContext
      );

      expect(mockedCLI.releases.new).toHaveBeenCalledWith("1.0.0");
      expect(mockedAddSpanToTxn).toHaveBeenCalledWith(ctx, "function.plugin.create_release");
      expect(mockedChildSpan.finish).toHaveBeenCalled();
    });
  });

  describe("cleanArtifacts", () => {
    it("doest do anything if cleanArtifacts is not true", async () => {
      await cleanArtifacts({} as InternalOptions, ctx as unknown as BuildContext);

      expect(mockedCLI.releases.execute).not.toHaveBeenCalled();
      expect(mockedAddSpanToTxn).not.toHaveBeenCalled();
      expect(mockedChildSpan.finish).not.toHaveBeenCalled();
    });

    it("makes a call to Sentry CLI's artifact removal command if `cleanArtifacts` is set", async () => {
      await cleanArtifacts(
        { release: "1.0.0", cleanArtifacts: true } as InternalOptions,
        ctx as unknown as BuildContext
      );

      expect(mockedCLI.releases.execute).toHaveBeenCalledWith(
        ["releases", "files", "1.0.0", "delete", "--all"],
        true
      );
      expect(mockedAddSpanToTxn).toHaveBeenCalledWith(ctx, "function.plugin.clean_artifacts");
      expect(mockedChildSpan.finish).toHaveBeenCalled();
    });
  });

  describe("uploadSourceMaps", () => {
    it("makes a call to Sentry CLI's sourcemaps upload command", async () => {
      const options = {
        release: "1.0.0",
        include: [{ paths: ["dist"] }],
      } as InternalOptions;

      await uploadSourceMaps(options, ctx as unknown as BuildContext);

      expect(mockedCLI.releases.uploadSourceMaps).toHaveBeenCalledWith("1.0.0", {
        include: [{ paths: ["dist"] }],
      });
      expect(mockedAddSpanToTxn).toHaveBeenCalledWith(ctx, "function.plugin.upload_sourcemaps");
      expect(mockedChildSpan.finish).toHaveBeenCalled();
    });
  });

  describe("setCommits", () => {
    it("doesn't do anything if `setCommits` option is not specified", async () => {
      await setCommits({} as InternalOptions, ctx as unknown as BuildContext);

      expect(mockedCLI.releases.setCommits).not.toHaveBeenCalled();
      expect(mockedAddSpanToTxn).not.toHaveBeenCalled();
      expect(mockedChildSpan.finish).not.toHaveBeenCalled();
    });

    it("makes a call to Sentry CLI if the correct options are specified", async () => {
      await setCommits(
        { setCommits: { auto: true }, release: "1.0.0" } as InternalOptions,
        ctx as unknown as BuildContext
      );

      expect(mockedCLI.releases.setCommits).toHaveBeenCalledWith("1.0.0", { auto: true });
      expect(mockedAddSpanToTxn).toHaveBeenCalledWith(ctx, "function.plugin.set_commits");
      expect(mockedChildSpan.finish).toHaveBeenCalled();
    });
  });

  describe("finalizeRelease", () => {
    it("doesn't do anything if `finalize` is not set", async () => {
      await finalizeRelease({} as InternalOptions, ctx as unknown as BuildContext);

      expect(mockedCLI.releases.finalize).not.toHaveBeenCalled();
      expect(mockedAddSpanToTxn).not.toHaveBeenCalled();
      expect(mockedChildSpan.finish).not.toHaveBeenCalled();
    });

    it("makes a call to Sentry CLI's release finalization command if `finalize` is true", async () => {
      await finalizeRelease(
        { release: "1.0.0", finalize: true } as InternalOptions,
        ctx as unknown as BuildContext
      );

      expect(mockedCLI.releases.finalize).toHaveBeenCalledWith("1.0.0");
      expect(mockedAddSpanToTxn).toHaveBeenCalledWith(ctx, "function.plugin.finalize_release");
      expect(mockedChildSpan.finish).toHaveBeenCalled();
    });
  });

  describe("addDeploy", () => {
    it("doesn't do anything if `deploy` option is not specified", async () => {
      await addDeploy({} as InternalOptions, ctx as unknown as BuildContext);

      expect(mockedCLI.releases.newDeploy).not.toHaveBeenCalled();
      expect(mockedAddSpanToTxn).not.toHaveBeenCalled();
      expect(mockedChildSpan.finish).not.toHaveBeenCalled();
    });

    it("makes a call to Sentry CLI if the correct options are specified", async () => {
      const deployOptions = {
        env: "production",
        started: 0,
        finished: 10,
        name: "myDeployment",
        url: "https://my-deploy-server.com",
      };

      await addDeploy(
        { deploy: deployOptions, release: "1.0.0" } as InternalOptions,
        ctx as unknown as BuildContext
      );

      expect(mockedCLI.releases.newDeploy).toHaveBeenCalledWith("1.0.0", deployOptions);
      expect(mockedAddSpanToTxn).toHaveBeenCalled();
      expect(mockedChildSpan.finish).toHaveBeenCalled();
    });
  });
});
