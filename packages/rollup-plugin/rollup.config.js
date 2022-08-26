import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import packageJson from "./package.json";
import modulePackage from "module";

const input = ["src/index.ts"];

const extensions = [".ts"];

export default {
  input,
  external: [...Object.keys(packageJson.dependencies), ...modulePackage.builtinModules],
  plugins: [
    resolve({ extensions, preferBuiltins: true }),
    babel({
      extensions,
      babelHelpers: "bundled",
      include: ["src/**/*"],
    }),
  ],
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
