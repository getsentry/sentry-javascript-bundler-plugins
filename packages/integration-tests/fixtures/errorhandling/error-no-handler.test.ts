/* eslint-disable jest/no-standalone-expect */
/* eslint-disable jest/expect-expect */
import path from "path";
import { spawn } from "child_process";

jest.setTimeout(10_000);

describe("Error throwing by default (no errorHandler)", () => {
  const FAKE_SENTRY_PORT = "9876";

  const sentryServer = spawn("node", [path.join(__dirname, "fakeSentry.js")], {
    cwd: __dirname,
    stdio: "ignore", // <-- set to "inherit" to get server logs. Deactivated to avoid test logs.
    env: { ...process.env, FAKE_SENTRY_PORT },
    shell: true,
  });

  beforeAll(async () => {
    await new Promise<void>((resolve) =>
      sentryServer.on("spawn", () => {
        resolve();
      })
    );
  });

  afterAll(() => {
    sentryServer.kill();
  });

  const bundlersToTest = ["vite", "rollup", "webpack5", "esbuild"];
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (parseInt(process.version.split(".")[0]!.slice(1)) < 18) {
    bundlersToTest.push("webpack4");
  }

  test.each(bundlersToTest)(
    "doesn't throw when Sentry server responds with error code for %s",
    async (bundler) => {
      const buildProcess = spawn("yarn", ["ts-node", path.join(__dirname, `build-${bundler}.ts`)], {
        env: { ...process.env, FAKE_SENTRY_PORT },
        stdio: "ignore", // <-- set to "inherit" to get build output. Deactivated to avoid spamming test logs.
        shell: true,
      });

      const exitCode = await new Promise<number>((resolve, reject) => {
        buildProcess.on("exit", (code) => {
          resolve(code ?? 99);
        });

        buildProcess.on("error", (err) => {
          reject(err);
        });
      });

      expect(exitCode).toBe(0);

      buildProcess.kill();
    }
  );
});
