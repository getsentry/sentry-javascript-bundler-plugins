import { sentryRollupPlugin } from "@sentry/rollup-plugin";
import { defineConfig } from "rolldown";

export default defineConfig({
  input: "src/basic.js",
  output: {
    file: "out/build-info/basic.js",
  },
  plugins: [
    sentryRollupPlugin({
      telemetry: false,
      release: {
        name: "build-information-injection-test",
      },
      _experiments: { injectBuildInformation: true },
    }),
  ],
});
