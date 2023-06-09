const { sentryEsbuildPlugin } = require("@sentry/esbuild-plugin");
const { build } = require("esbuild");

build({
  entryPoints: ["./src/get-global.js", "./src/hello-world.js"],
  outdir: "./out/esbuild",
  plugins: [
    sentryEsbuildPlugin({
      debug: true,
    }),
  ],
  minify: true,
  bundle: true,
  format: "cjs",
  sourcemap: true,
});
