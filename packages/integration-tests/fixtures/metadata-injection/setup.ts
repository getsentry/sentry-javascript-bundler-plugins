import * as path from "path";
import { createCjsBundles } from "../../utils/create-cjs-bundles";

const outputDir = path.resolve(__dirname, "out");

createCjsBundles(
  {
    bundle: path.resolve(__dirname, "input", "bundle.js"),
  },
  outputDir,
  {
    _experiments: {
      moduleMetadata: { team: "frontend" },
    },
  },
  ["webpack4", "webpack5", "esbuild"]
);
