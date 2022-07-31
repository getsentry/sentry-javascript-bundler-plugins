// @ts-check
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import { sentryRollupPlugin } from "@sentry/unplugin";

const input = ["src/entrypoint1.js"];

const extensions = [".js"];

export default {
  input,
  plugins: [resolve({ extensions }), commonjs(), sentryRollupPlugin()],
  output: {
    dir: "./out/rollup",
    format: "cjs",
    exports: "named",
    sourcemap: true,
  },
};
