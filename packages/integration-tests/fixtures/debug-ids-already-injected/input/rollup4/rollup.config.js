import { defineConfig } from "rollup";
import { sentryRollupPlugin } from "@sentry/rollup-plugin";
import { join, posix } from "path";

const __dirname = new URL(".", import.meta.url).pathname;

console.log({
  __dirname,
  posixInput: posix.join(__dirname, "bundle.js"),
  input: join(__dirname, "..", "bundle.js"),
  outputPath: join(__dirname, "..", "..", "out", "rollup4"),
  posixOutputPath: posix.join(__dirname, "..", "..", "out", "rollup4"),
});

export default defineConfig({
  input: { index: posix.join(__dirname, "bundle.js") },
  output: {
    dir: posix.join(__dirname, "..", "..", "out", "rollup4"),
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
