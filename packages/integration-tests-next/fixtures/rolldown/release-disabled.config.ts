import { sentryRollupPlugin } from "@sentry/rollup-plugin";
import { defineConfig } from "rolldown";

export default defineConfig({
  input: "src/basic.js",
  output: {
    file: "out/release-disabled/basic.js",
  },
  plugins: [
    sentryRollupPlugin({
      telemetry: false,
      authToken: "fake-auth",
      org: "fake-org",
      project: "fake-project",
      release: { create: false },
    }),
  ],
});
