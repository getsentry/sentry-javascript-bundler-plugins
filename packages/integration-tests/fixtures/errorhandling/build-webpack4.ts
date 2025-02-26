import { sentryWebpackPlugin } from "@sentry/webpack-plugin";
import * as path from "path";
import { default as webpack4 } from "webpack4";
import pluginOptions from "./plugin-options";

webpack4(
  {
    devtool: "source-map",
    cache: false,
    entry: {
      index: path.join(__dirname, "input", "bundle.js"),
    },
    output: {
      path: path.join(__dirname, "out", "webpack4"),
      libraryTarget: "commonjs",
    },
    mode: "production",
    target: "node", // needed for webpack 4 so we can access node api
    plugins: [sentryWebpackPlugin(pluginOptions)],
  },
  (err) => {
    if (err) {
      process.exit(1);
    }
  }
);
