import { sentryWebpackPlugin } from "@sentry/webpack-plugin";
import * as path from "path";
import { default as webpack4 } from "webpack4";
import pluginOptions from "./plugin-options";

webpack4(
  {
    mode: "production",
    entry: {
      index: path.join(__dirname, "input", "index.js"),
    },
    cache: false,
    output: {
      path: path.join(__dirname, "out", "webpack4"),
      libraryTarget: "commonjs",
    },
    target: "node", // needed for webpack 4 so we can access node api
    plugins: [sentryWebpackPlugin(pluginOptions)],
  },
  (err) => {
    if (err) {
      throw err;
    }
  }
);
