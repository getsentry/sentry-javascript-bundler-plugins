const { sentryWebpackPlugin } = require("@sentry/webpack-plugin");
const { sentryConfig } = require("../configs/basic.config.js");
const { resolve } = require("node:path");

module.exports = {
  cache: false,
  entry: "./src/basic.js",
  output: {
    path: resolve("./out/basic-cjs"),
    filename: "basic.js",
  },
  optimization: {
    minimize: false,
  },
  mode: "production",
  plugins: [sentryWebpackPlugin(sentryConfig)],
};
