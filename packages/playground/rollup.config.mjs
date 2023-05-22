// @ts-check
import { sentryRollupPlugin } from "@sentry/rollup-plugin";
import fs from "fs";

const input = ["src/entrypoint1.js"];

export default {
  input,
  plugins: [
    sentryRollupPlugin({
      sourcemaps: {
        assets: "./out/rollup/**",
        deleteFilesAfterUpload: "./out/rollup/**/*.map",
      },
    }),
  ],
  output: {
    dir: "./out/rollup",
    format: "cjs",
    exports: "named",
    sourcemap: true,
  },
};
