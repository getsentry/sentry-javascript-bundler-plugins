const { sentryEsbuildPlugin } = require("@sentry/esbuild-plugin");
const { build } = require("esbuild");

build({
  entryPoints: ["./src/entrypoint1.js"],
  outdir: "./out/esbuild",
  plugins: [
    sentryEsbuildPlugin({
      sourcemaps: {
        assets: "./out/esbuild/**",
        deleteFilesAfterUpload: "./out/esbuild/**/*.map",
      },
    }),
  ],
  minify: true,
  bundle: true,
  format: "cjs",
  sourcemap: true,
});
