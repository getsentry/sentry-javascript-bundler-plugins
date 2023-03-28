// @ts-check
import { sentryRollupPlugin } from "@sentry/bundler-plugin-core";
import placeHolderOptions from "./config.json";

const input = ["src/entrypoint1.js"];

const extensions = [".js"];

export default {
  input,
  plugins: [
    sentryRollupPlugin({
      ...placeHolderOptions,
    }),
  ],
  output: {
    dir: "./out/rollup",
    format: "cjs",
    exports: "named",
    sourcemap: true,
  },
};
