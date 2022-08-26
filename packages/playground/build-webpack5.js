// @ts-check
const path = require("path");
const webpack5 = require("webpack");
const { sentryWebpackPlugin } = require("@sentry/sentry-unplugin");

const placeHolderOptions = require("./config.json");

webpack5(
  {
    cache: false,
    entry: "./src/entrypoint1.js",
    output: {
      filename: "index.js",
      path: path.resolve(__dirname, `./out/webpack5`),
      library: {
        type: "commonjs",
        name: "ExampleBundle",
      },
    },
    mode: "production",
    plugins: [sentryWebpackPlugin({ ...placeHolderOptions })],
    devtool: "source-map",
  },
  (err) => {
    if (err) {
      throw err;
    }
  }
);
