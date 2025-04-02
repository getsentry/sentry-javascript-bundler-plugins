import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import packageJson from "./package.json";
import modulePackage from "module";

const input = ["src/index.ts", "src/webpack5.ts"];

const extensions = [".ts"];

export default {
  input,
  external: [...Object.keys(packageJson.dependencies), ...modulePackage.builtinModules, "webpack"],
  onwarn: (warning) => {
    if (warning.code === "CIRCULAR_DEPENDENCY") {
      // Circular dependencies are usually not a big deal for us so let's just warn about them
      console.warn(warning.message);
      return;
    }
    // Warnings are usually high-consequence for us so let's throw to catch them
    throw new Error(warning.message);
  },
  plugins: [
    resolve({
      extensions,
      rootDir: "./src",
      preferBuiltins: true,
    }),
    babel({
      extensions,
      babelHelpers: "bundled",
      include: ["src/**/*"],
    }),
  ],
  output: [
    {
      dir: "./dist/esm",
      format: "esm",
      exports: "named",
      sourcemap: true,
      entryFileNames: "[name].mjs",
    },
    {
      dir: "./dist/cjs",
      format: "cjs",
      exports: "named",
      sourcemap: true,
    },
  ],
};
