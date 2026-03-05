import { sentryRollupPlugin } from "@sentry/rollup-plugin";
import { defineConfig } from "rolldown";

export default defineConfig({
  input: "src/basic.js",
  output: {
    file: "out/debugids-already-injected/basic.js",
    sourcemap: true,
    sourcemapDebugIds: true,
  },
  plugins: [
    sentryRollupPlugin({
      telemetry: false,
      // We need to specify these so that upload is attempted. Debug IDs will be injected before then...
      authToken: "fake-auth",
      org: "fake-org",
      project: "fake-project",
    }),
  ],
});
