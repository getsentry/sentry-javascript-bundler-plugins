import * as path from "path";
import { createCjsBundles } from "../../utils/create-cjs-bundles-for-react";

const entryPointPath = path.resolve(__dirname, "input", "app.jsx");
const outputDir = path.resolve(__dirname, "out");

createCjsBundles({ index: entryPointPath }, outputDir, {
  telemetry: false,
  reactComponentAnnotation: { enabled: true },
});
