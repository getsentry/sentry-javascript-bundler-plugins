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
} from "@sentry/bundler-plugin-core";

export function createCjsBundles(
  entrypoints: { [name: string]: string },
  outFolder: string,
  sentryUnpluginOptions: Options
): void {
  void vite.build({
    clearScreen: false,
    build: {
      outDir: path.join(outFolder, "vite"),
      rollupOptions: {
        input: entrypoints,
        output: {
          format: "cjs",
          entryFileNames: "[name].js",
        },
      },
    },
    plugins: [sentryVitePlugin(sentryUnpluginOptions)],
  });

  void rollup
    .rollup({
      input: entrypoints,
      plugins: [sentryRollupPlugin(sentryUnpluginOptions)],
    })
    .then((bundle) =>
      bundle.write({
        dir: path.join(outFolder, "rollup"),
        format: "cjs",
        exports: "named",
      })
    );

  void esbuild.build({
    entryPoints: entrypoints,
    outdir: path.join(outFolder, "esbuild"),
    plugins: [sentryEsbuildPlugin(sentryUnpluginOptions)],
    minify: true,
    bundle: true,
    format: "cjs",
  });

  webpack4(
    {
      mode: "production",
      entry: entrypoints,
      cache: false,
      output: {
        path: path.join(outFolder, "webpack4"),
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
      entry: entrypoints,
      output: {
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
