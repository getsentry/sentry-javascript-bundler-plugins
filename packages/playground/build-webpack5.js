// @ts-check
const path = require("path");
const webpack5 = require("webpack");
const { sentryWebpackPlugin } = require("@sentry/webpack-plugin");

webpack5(
  {
    cache: false,
    entry: "./src/entrypoint1.js",
    output: {
      filename: "index.js",
      path: path.resolve(__dirname, "out", "webpack5"),
      library: {
        type: "commonjs",
        name: "ExampleBundle",
      },
    },
    mode: "production",
    plugins: [
      sentryWebpackPlugin({
        sourcemaps: {
          assets: "./out/webpack5/**",
          deleteFilesAfterUpload: "./out/webpack5/**/*.map",
        },
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
