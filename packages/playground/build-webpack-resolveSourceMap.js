// @ts-check
const path = require("path");
const webpack5 = require("webpack5");
const { sentryWebpackPlugin } = require("@sentry/webpack-plugin");

const baseDir = path.resolve(__dirname, "out", "webpack-resolveSourceMap")
const OUTPUT_DIR = path.resolve(baseDir, "webpack");
const SOURCE_MAPS_DIR = path.resolve(baseDir, "sourcemaps")
const SOURCE_MAP_HOST = "https://sourcemaps.example.com/foo"

webpack5(
  {
    cache: false,
    entry: "./src/entrypoint1.js",
    output: {
      filename: "index.js",
      path: OUTPUT_DIR,
      library: {
        type: "commonjs",
        name: "ExampleBundle",
      },
    },
    mode: "production",
    devtool: false,
    plugins: [
      new webpack5.SourceMapDevToolPlugin({
        filename: `../sourcemaps/[file].map`,
        append: `\n//# sourceMappingURL=${SOURCE_MAP_HOST}/[file].map`,
      }),
      sentryWebpackPlugin({
        debug: true,
        sourcemaps: {
          resolveSourceMap(artifactPath, sourceMappingUrl) {
            return sourceMappingUrl?.replace(SOURCE_MAP_HOST, SOURCE_MAPS_DIR)
          }
        }
      }),
    ],
  },
  (err) => {
    if (err) {
      throw err;
    }
  }
);
