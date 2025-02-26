import { sentryWebpackPlugin } from "@sentry/webpack-plugin";
import * as path from "path";
import { webpack as webpack5 } from "webpack5";
import pluginOptions from "./plugin-options";

webpack5(
  {
    devtool: "source-map",
    cache: false,
    entry: {
      index: path.join(__dirname, "input", "bundle.js"),
    },
    output: {
      path: path.join(__dirname, "out", "webpack5"),
      library: {
        type: "commonjs",
      },
    },
    mode: "production",
    plugins: [sentryWebpackPlugin(pluginOptions)],
  },
  (err) => {
    if (err) {
      process.exit(1);
    }
  }
);
