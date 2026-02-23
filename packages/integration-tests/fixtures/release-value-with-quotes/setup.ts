import * as path from "path";
import { createCjsBundles } from "../../utils/create-cjs-bundles";

const outputDir = path.resolve(__dirname, "out");

createCjsBundles(
  {
    bundle: path.resolve(__dirname, "input", "bundle.js"),
  },
  outputDir,
  {
    release: { name: 'i am a dangerous release value because I contain a "' },
  },
  ["webpack4", "webpack5", "esbuild", "rollup", "vite"]
);
