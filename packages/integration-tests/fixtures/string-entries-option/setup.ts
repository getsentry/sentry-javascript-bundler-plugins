import { Options } from "@sentry/bundler-plugin-core";
import * as path from "path";
import { createCjsBundles } from "../../utils/create-cjs-bundles";

const entryPoint1Path = path.resolve(__dirname, "input", "entrypoint1.js");
const entryPoint2Path = path.resolve(__dirname, "input", "entrypoint2.js");
const outputDir = path.resolve(__dirname, "out");

createCjsBundles({ entrypoint1: entryPoint1Path, entrypoint2: entryPoint2Path }, outputDir, {
  release: "I AM A RELEASE!",
  include: outputDir,
  releaseInjectionTargets: entryPoint1Path,
  dryRun: true,
} as Options);
