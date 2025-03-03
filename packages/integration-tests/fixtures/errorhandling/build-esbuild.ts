import { sentryEsbuildPlugin } from "@sentry/esbuild-plugin";
import { build } from "esbuild";
import pluginOptions from "./plugin-options";
import path from "path";

build({
  entryPoints: [path.join(__dirname, "input", "bundle.js")],
  outdir: path.join(__dirname, "out", "esbuild"),
  plugins: [sentryEsbuildPlugin(pluginOptions)],
  minify: true,
  bundle: true,
  format: "cjs",
  sourcemap: true,
}).catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
