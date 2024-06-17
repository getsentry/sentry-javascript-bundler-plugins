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
      debug: true,
      sourcemaps: {
        filesToDeleteAfterUpload: path.join(".", "**", "after-upload-deletion", "**", "*.map"),
      },
    },
    [bundler]
  );
});

console.log(
  "ASDFASDF",
  __dirname,
  process.cwd(),
  path.join(".", "**", "after-upload-deletion", "**", "*.map")
);
