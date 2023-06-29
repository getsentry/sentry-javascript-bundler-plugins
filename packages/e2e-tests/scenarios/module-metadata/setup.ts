import * as path from "path";

import { pluginConfig } from "./config";
import { createCjsBundles } from "../../utils/create-cjs-bundles";
import { MODULE_META_BUNDLERS } from "../../utils/bundlers";

const entryPointPath = path.resolve(__dirname, "input", "index.js");
const outputDir = path.resolve(__dirname, "out");

createCjsBundles(MODULE_META_BUNDLERS, { index: entryPointPath }, outputDir, pluginConfig);
