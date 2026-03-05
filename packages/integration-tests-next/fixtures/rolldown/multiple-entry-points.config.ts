import { sentryRollupPlugin } from "@sentry/rollup-plugin";
import { defineConfig } from "rolldown";

export default defineConfig({
  input: ["src/entry1.js", "src/entry2.js"],
  output: {
    dir: "out/multiple-entry-points",
    chunkFileNames: "[name].js",
  },
  plugins: [sentryRollupPlugin({ telemetry: false, release: { inject: false } })],
});
