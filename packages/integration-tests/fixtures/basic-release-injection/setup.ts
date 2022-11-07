import { Options } from "@sentry/bundler-plugin-core";
import * as path from "path";
import { createCjsBundles } from "../../utils/create-cjs-bundles";

const entryPointPath = path.resolve(__dirname, "./input/entrypoint.js");
const outputDir = path.resolve(__dirname, "./out");

createCjsBundles({ index: entryPointPath }, outputDir, {
  release: "I AM A RELEASE!",
  include: outputDir,
  dryRun: true,
} as Options);
