import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import packageJson from "./package.json";

const input = ["src/index.ts"];

const extensions = [".js", ".ts"];

export default {
  input,
  // external: [...Object.keys(packageJson.dependencies)],
  external: ["path", "unplugin"],
  plugins: [
    resolve({ extensions, preferBuiltins: true }),
    commonjs(),
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
