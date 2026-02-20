import { sentryWebpackPlugin } from "@sentry/webpack-plugin";
import * as path from "path";
import { webpack } from "webpack";
import pluginOptions from "./plugin-options";

webpack(
  {
    cache: false,
    entry: {
      index: path.join(__dirname, "input", "index.js"),
    },
    output: {
      path: path.join(__dirname, "out", "webpack"),
      library: {
        type: "commonjs",
      },
    },
    mode: "production",
    plugins: [sentryWebpackPlugin(pluginOptions)],
  },
  (err) => {
    if (err) {
      throw err;
    }
  }
);
