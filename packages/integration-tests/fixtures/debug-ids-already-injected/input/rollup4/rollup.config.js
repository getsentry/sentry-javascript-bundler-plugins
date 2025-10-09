import { defineConfig } from "rollup";
import { sentryRollupPlugin } from "@sentry/rollup-plugin";
import { join } from "path";
import { existsSync } from "fs";

const __dirname = new URL(".", import.meta.url).pathname;

console.log({
  __dirname,
  input: join(__dirname, "bundle.js"),
  existsInput: existsSync(join(__dirname, "bundle.js")),
  outputPath: join(__dirname, "..", "..", "out", "rollup4"),
});

export default defineConfig({
  input: { index: join(__dirname, "bundle.js") },
  output: {
    dir: join(__dirname, "..", "..", "out", "rollup4"),
    sourcemap: true,
    sourcemapDebugIds: true,
  },
  plugins: [
    sentryRollupPlugin({
      telemetry: false,
      authToken: "fake-auth",
      org: "fake-org",
      project: "fake-project",
    }),
  ],
});
