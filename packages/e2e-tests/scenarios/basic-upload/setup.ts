import * as path from "path";

import { pluginConfig } from "./config";
import { deleteAllReleases } from "../../utils/releases";
import { createCjsBundles } from "../../utils/create-cjs-bundles";

deleteAllReleases(pluginConfig.release?.name || "")
  .then(() => {
    const entryPointPath = path.resolve(__dirname, "input", "index.js");
    const outputDir = path.resolve(__dirname, "out");

    createCjsBundles({ index: entryPointPath }, outputDir, pluginConfig);
  })
  .catch(() => {
    console.error("Could not delete release!");
  });
