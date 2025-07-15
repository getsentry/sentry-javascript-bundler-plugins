import { defineConfig } from "rollup";
import { sentryRollupPlugin } from "@sentry/rollup-plugin";
import { join } from "path";

const __dirname = new URL(".", import.meta.url).pathname;

export default defineConfig({
  input: { index: join(__dirname, "..", "bundle.js") },
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
