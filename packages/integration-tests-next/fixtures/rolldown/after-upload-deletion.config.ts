import { sentryRollupPlugin } from "@sentry/rollup-plugin";
import { defineConfig } from "rolldown";

export default defineConfig({
  input: "src/basic.js",
  output: {
    file: "out/after-upload-deletion/basic.js",
    sourcemap: true,
  },
  plugins: [
    sentryRollupPlugin({
      telemetry: false,
      sourcemaps: {
        filesToDeleteAfterUpload: ["out/after-upload-deletion/basic.js.map"],
      },
    }),
  ],
});
