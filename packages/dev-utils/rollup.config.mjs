import packageJson from "./package.json" with { type: "json" };
import modulePackage from "module";

export default {
  platform: "node",
  input: ["src/index.ts"],
  output: [
    {
      file: packageJson.module,
      format: "esm",
      exports: "named",
      sourcemap: true,
    },
  ],
};
