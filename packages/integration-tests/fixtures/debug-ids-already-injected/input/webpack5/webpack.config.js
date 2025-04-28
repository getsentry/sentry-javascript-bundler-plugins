/* eslint-disable @typescript-eslint/no-var-requires */
const { sentryWebpackPlugin } = require("@sentry/webpack-plugin");
const path = require("path");

export default {
  devtool: "source-map-debugids",
  cache: false,
  entry: { index: path.join(__dirname, "..", "bundle.js") },
  output: {
    path: path.join(__dirname, "..", "..", "out", "webpack5"),
    library: {
      type: "commonjs",
    },
  },
  mode: "production",
  plugins: [sentryWebpackPlugin({ telemetry: false })],
};
