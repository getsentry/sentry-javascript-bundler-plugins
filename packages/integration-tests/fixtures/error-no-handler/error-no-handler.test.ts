/* eslint-disable jest/no-standalone-expect */
/* eslint-disable jest/expect-expect */
import path from "path";
import { createCjsBundles } from "../../utils/create-cjs-bundles-promise";
import { spawn } from "child_process";

describe("Doesn't crash when Sentry responds with HTTP errors during upload and release creation", () => {
  test("webpack4", async () => {
    const FAKE_SENTRY_PORT = "9876";

    const sentryServer = spawn("node", ["fakeSentry.js"], {
      stdio: "inherit",
      env: { ...process.env, FAKE_SENTRY_PORT },
    });

    await new Promise<void>((resolve) =>
      sentryServer.on("spawn", () => {
        resolve();
      })
    );

    const outputDir = path.resolve(__dirname, "out");

    for (const bundler of ["webpack4", "webpack5", "esbuild", "rollup", "vite"]) {
      await expect(
        createCjsBundles(
          {
            bundle: path.resolve(__dirname, "input", "bundle.js"),
          },
          outputDir,
          {
            url: `http://localhost:${FAKE_SENTRY_PORT}`,
            authToken: "fake-auth",
            org: "fake-org",
            project: "fake-project",
            release: {
              name: "1.0.0",
            },
          },
          [bundler]
        )
      ).resolves.not.toThrow();
    }

    sentryServer.kill();
  });
});
