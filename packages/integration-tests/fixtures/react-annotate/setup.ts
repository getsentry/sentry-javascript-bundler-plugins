import * as path from "path";
import { createCjsBundles } from "../../utils/create-cjs-bundles";

const entryPointPath = path.resolve(__dirname, "input", "app.jsx");
const outputDir = path.resolve(__dirname, "out");

createCjsBundles(
  { index: entryPointPath },
  outputDir,
  {
    telemetry: false,
  },
  // TODO: Webpack 4
  // TODO: Esbuild
  ["rollup", "vite", "webpack5"]
);
