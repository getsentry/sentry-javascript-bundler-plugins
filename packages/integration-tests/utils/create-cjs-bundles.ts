import * as vite from "vite";
import * as path from "path";
import * as rollup from "rollup";
import { default as webpack4 } from "webpack4";
import { webpack as webpack5 } from "webpack";
import * as esbuild from "esbuild";
import {
  sentryEsbuildPlugin,
  sentryRollupPlugin,
  sentryVitePlugin,
  sentryWebpackPlugin,
  Options,
} from "@sentry/unplugin";

export function createCjsBundles(
  entryPointPath: string,
  outFolder: string,
  sentryUnpluginOptions: Options
): void {
  void vite.build({
    clearScreen: false,
    build: {
      outDir: path.join(outFolder, "vite"),
      lib: {
        entry: entryPointPath,
        fileName: "index",
        formats: ["cjs"],
      },
    },
    plugins: [sentryVitePlugin(sentryUnpluginOptions)],
  });

  void rollup
    .rollup({
      input: entryPointPath,
      plugins: [sentryRollupPlugin(sentryUnpluginOptions)],
    })
    .then((bundle) =>
      bundle.write({
        file: path.join(outFolder, "rollup/index.js"),
        format: "cjs",
        exports: "named",
      })
    );

  void esbuild.build({
    entryPoints: [entryPointPath],
    outfile: path.join(outFolder, "esbuild/index.js"),
    plugins: [sentryEsbuildPlugin(sentryUnpluginOptions)],
    minify: true,
    bundle: true,
    format: "cjs",
  });

  webpack4(
    {
      mode: "production",
      entry: entryPointPath,
      cache: false,
      output: {
        path: path.join(outFolder, "webpack4"),
        filename: "index.js",
        libraryTarget: "commonjs",
      },
      target: "node", // needed for webpack 4 so we can access node api
      plugins: [sentryWebpackPlugin(sentryUnpluginOptions)],
    },
    (err) => {
      if (err) {
        throw err;
      }
    }
  );

  webpack5(
    {
      cache: false,
      entry: entryPointPath,
      output: {
        filename: "index.js",
        path: path.join(outFolder, "webpack5"),
        library: {
          type: "commonjs",
        },
      },
      mode: "production",
      plugins: [sentryWebpackPlugin(sentryUnpluginOptions)],
    },
    (err) => {
      if (err) {
        throw err;
      }
    }
  );
}
