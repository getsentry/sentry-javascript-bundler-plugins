import * as path from "path";
import { createCjsBundles } from "../../utils/create-cjs-bundles";

const outputDir = path.resolve(__dirname, "out");

["webpack4", "webpack5", "esbuild", "rollup", "vite"].forEach((bundler) => {
  createCjsBundles(
    {
      bundle: path.resolve(__dirname, "input", "bundle.js"),
    },
    outputDir,
    {
      sourcemaps: {
        filesToDeleteAfterUpload: [path.join(__dirname, "out", bundler, "bundle.js.map")],
      },
    },
    [bundler]
  );
});
