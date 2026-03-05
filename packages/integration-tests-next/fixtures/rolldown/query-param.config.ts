import { sentryRollupPlugin } from "@sentry/rollup-plugin";
import { defineConfig } from "rolldown";

export default defineConfig({
  input: ["src/entry1.js", "src/entry2.js"],
  output: {
    dir: "out/query-param",
    chunkFileNames: "[name].js?seP58q4g",
  },
  plugins: [sentryRollupPlugin({ telemetry: false })],
});
