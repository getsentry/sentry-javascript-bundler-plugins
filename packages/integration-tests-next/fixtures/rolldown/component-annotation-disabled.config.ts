import { sentryRollupPlugin } from "@sentry/rollup-plugin";
import { defineConfig } from "rolldown";

export default defineConfig({
  input: "src/app.jsx",
  // We exclude these to keep the snapshot small
  external: [/node_modules/],
  makeAbsoluteExternalsRelative: true,
  output: {
    file: "out/component-annotation-disabled/app.js",
  },
  plugins: [sentryRollupPlugin({ telemetry: false })],
});
