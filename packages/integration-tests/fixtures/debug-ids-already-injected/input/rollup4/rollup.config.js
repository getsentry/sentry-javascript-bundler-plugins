/* eslint-disable @typescript-eslint/no-var-requires */
const { defineConfig } = require("rollup");
const { sentryRollupPlugin } = require("@sentry/rollup-plugin");
const path = require("path");

export default defineConfig({
  input: { index: path.join(__dirname, "..", "bundle.js") },
  output: {
    dir: path.join(__dirname, "..", "..", "out", "rollup4"),
    sourcemap: true,
    sourcemapDebugIds: true,
  },
  plugins: [sentryRollupPlugin({ telemetry: false })],
});
