import * as path from "path";
import { createCjsBundlesWithQueryParam } from "../../utils/create-cjs-bundles-with-query";

// Query params and hashes are weird on windows
if (process.platform !== "win32") {
  const outputDir = path.resolve(__dirname, "out");
  createCjsBundlesWithQueryParam(
    {
      bundle1: path.resolve(__dirname, "input", "bundle1.js"),
      bundle2: path.resolve(__dirname, "input", "bundle2.js"),
    },
    outputDir,
    {
      telemetry: false,
      release: { name: "I AM A RELEASE!", create: false },
    }
  );
}
