import * as path from "path";
import { createCjsBundles } from "../../utils/create-cjs-bundles";

const outputDir = path.resolve(__dirname, "out");

createCjsBundles(
  {
    bundle1: path.resolve(__dirname, "input", "bundle1.js"),
    bundle2: path.resolve(__dirname, "input", "bundle2.js"),
  },
  outputDir,
  {
    telemetry: false,
    sourcemaps: {
      disable: true,
    },
  }
);
