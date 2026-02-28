import { sentryRollupPlugin } from "@sentry/rollup-plugin";
import { defineConfig } from "rolldown";

export default defineConfig({
  input: "src/basic.js",
  output: {
    file: "out/module-metadata/basic.js",
  },
  plugins: [
    sentryRollupPlugin({ telemetry: false, moduleMetadata: { something: "value", another: 999 } }),
  ],
});
