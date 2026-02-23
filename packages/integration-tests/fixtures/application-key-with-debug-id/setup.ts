import * as path from "path";
import { createCjsBundles } from "../../utils/create-cjs-bundles";

const outputDir = path.resolve(__dirname, "out");

createCjsBundles(
  {
    bundle: path.resolve(__dirname, "input", "bundle.js"),
  },
  outputDir,
  {
    // Enable applicationKey AND debug ID injection (sourcemaps enabled by default)
    applicationKey: "my-app-key",
    telemetry: false,
    release: { name: "test-release", create: false },
  },
  ["webpack4", "webpack5", "esbuild", "rollup", "vite"]
);
