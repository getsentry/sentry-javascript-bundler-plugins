const { sentryEsbuildPlugin } = require("@sentry/unplugin");
const { build } = require("esbuild");
const placeHolderOptions = require("./config.json");

build({
  entryPoints: ["./src/entrypoint1.js"],
  outdir: "./out/esbuild",
  plugins: [
    sentryEsbuildPlugin({
      ...placeHolderOptions,
    }),
  ],
  minify: true,
  bundle: true,
  format: "cjs",
  sourcemap: true,
});
