import { sentryRollupPlugin } from "@sentry/rollup-plugin";
import { defineConfig } from "rolldown";

export default defineConfig({
  input: "src/basic.js",
  output: {
    file: "out/basic-release-disabled/basic.js",
  },
  plugins: [sentryRollupPlugin({ telemetry: false, release: { create: false, inject: false } })],
});
