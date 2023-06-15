import * as path from "path";
import { createCjsBundles } from "../../utils/create-cjs-bundles";

const entryPointPath = path.resolve(__dirname, "input", "entrypoint.js");
const outputDir = path.resolve(__dirname, "out");

createCjsBundles({ index: entryPointPath }, outputDir, {
  telemetry: false,
  release: { name: "I AM A RELEASE!", inject: false, create: false },
  project: "releasesProject",
  org: "releasesOrg",
});
