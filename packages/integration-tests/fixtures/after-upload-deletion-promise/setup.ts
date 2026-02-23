import * as path from "path";
import { createCjsBundles } from "../../utils/create-cjs-bundles";

const outputDir = path.resolve(__dirname, "out");

["webpack", "esbuild", "rollup", "vite"].forEach((bundler) => {
  const fileDeletionGlobPromise = new Promise<string[]>((resolve) => {
    setTimeout(() => {
      resolve([path.join(__dirname, "out", bundler, "bundle.js.map")]);
    }, 1000);
  });

  createCjsBundles(
    {
      bundle: path.resolve(__dirname, "input", "bundle.js"),
    },
    outputDir,
    {
      sourcemaps: {
        filesToDeleteAfterUpload: fileDeletionGlobPromise,
      },
    },
    [bundler]
  );
});
