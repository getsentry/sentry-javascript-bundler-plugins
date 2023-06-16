import path from "path";
import { createCjsBundles } from "../../utils/create-cjs-bundles";

createCjsBundles(
  {
    index: path.resolve(__dirname, "input", "index.js"),
  },
  path.resolve(__dirname, "out"),
  {
    telemetry: false,
    release: { name: "release", create: false },
  }
);
