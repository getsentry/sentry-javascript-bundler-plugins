// @ts-check
const path = require("path");
const webpack4 = require("webpack4");
const { sentryWebpackPlugin } = require("@sentry/unplugin");

const placeHolderOptions = require("./config.json");

webpack4(
  {
    mode: "production",
    entry: "./src/entrypoint1.js",
    cache: false,
    output: {
      path: path.resolve(__dirname, `./out/webpack4`),
      filename: "index.js",
      library: "ExampleBundle",
      libraryTarget: "commonjs",
    },
    plugins: [
      sentryWebpackPlugin({
        org: "sentry-sdks",
        project: "someProj",
        authToken: "1234",
        include: "*",
        debugLogging: true,
        debug: true,
      }),
    ],
    devtool: "source-map",
  },
  (err) => {
    if (err) {
      throw err;
    }
  }
);
