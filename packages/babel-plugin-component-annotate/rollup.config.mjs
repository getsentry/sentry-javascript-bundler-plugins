import packageJson from "./package.json" with { type: "json" };
import modulePackage from "module";

export default {
  platform: "node",
  input: ["src/index.ts"],
  external: Object.keys(packageJson.dependencies ?? []),
  output: [
    {
      file: packageJson.module,
      format: "esm",
      exports: "named",
      sourcemap: true,
    },
    {
      file: packageJson.main,
      format: "cjs",
      exports: "named",
      sourcemap: true,
    },
  ],
};
