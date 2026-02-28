import { sentryRollupPlugin } from "@sentry/rollup-plugin";
import { defineConfig } from "rolldown";

export default defineConfig({
  input: "src/basic.js",
  output: {
    file: "out/debugid-disabled/basic.js",
    sourcemap: true,
  },
  plugins: [
    sentryRollupPlugin({
      telemetry: false,
      sourcemaps: {
        disable: true,
      },
      release: {
        inject: false,
      },
    }),
  ],
});
