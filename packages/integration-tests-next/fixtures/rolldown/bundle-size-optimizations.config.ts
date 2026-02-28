import { sentryRollupPlugin } from "@sentry/rollup-plugin";
import { defineConfig } from "rolldown";

export default defineConfig({
  input: "src/bundle.js",
  output: {
    file: "out/bundle-size-optimizations/bundle.js",
  },
  plugins: [
    sentryRollupPlugin({
      telemetry: false,
      bundleSizeOptimizations: {
        excludeDebugStatements: true,
        excludeTracing: true,
        excludeReplayCanvas: true,
        excludeReplayIframe: true,
        excludeReplayShadowDom: true,
        excludeReplayWorker: true,
      },
    }),
  ],
});
