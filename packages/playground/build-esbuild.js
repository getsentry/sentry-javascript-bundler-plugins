const { sentryEsbuildPlugin } = require("@sentry/unplugin");
const { build } = require("esbuild");

build({
  entryPoints: ["./src/entrypoint1.js"],
  outdir: "./out/esbuild",
  plugins: [
    sentryEsbuildPlugin({
      org: "sentry-sdks",
      project: "someProj",
      authToken: "1234",
      include: "*",
      debugLogging: true,
      debug: true,
    }),
  ],
  minify: true,
  bundle: true,
  format: "cjs",
  sourcemap: true, // currently we break source maps :(, we need to fix this upstream in unplugin
});
