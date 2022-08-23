import * as path from "path";
import { createCjsBundles } from "../../utils/create-cjs-bundles";

const entryPointPath = path.resolve(__dirname, "./input/entrypoint.js");
const outputDir = path.resolve(__dirname, "./out");

createCjsBundles(entryPointPath, outputDir, { release: "I AM A RELEASE!", include: "" });
