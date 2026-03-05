import { sentryRollupPlugin } from "@sentry/rollup-plugin";
import { defineConfig } from "rolldown";

export default defineConfig({
  input: "src/basic.js",
  output: {
    file: "out/application-key/basic.js",
  },
  plugins: [sentryRollupPlugin({ telemetry: false, applicationKey: "1234567890abcdef" })],
});
