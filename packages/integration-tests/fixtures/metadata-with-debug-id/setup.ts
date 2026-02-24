import * as path from "path";
import { createCjsBundles } from "../../utils/create-cjs-bundles";

const outputDir = path.resolve(__dirname, "out");

createCjsBundles(
  {
    bundle: path.resolve(__dirname, "input", "bundle.js"),
  },
  outputDir,
  {
    // Enable both moduleMetadata AND debug ID injection (sourcemaps enabled by default)
    moduleMetadata: { team: "frontend" },
    telemetry: false,
    release: { name: "test-release", create: false },
  },
  ["webpack", "esbuild", "rollup", "vite"]
);
