import * as vite from "vite";
import * as path from "path";
import * as rollup from "rollup";
import { webpack } from "webpack";
import * as esbuild from "esbuild";
import { Options } from "@sentry/bundler-plugin-core";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { sentryWebpackPlugin } from "@sentry/webpack-plugin";
import { sentryEsbuildPlugin } from "@sentry/esbuild-plugin";
import { sentryRollupPlugin } from "@sentry/rollup-plugin";

type Bundlers = "webpack" | "esbuild" | "rollup" | "vite" | string;

export function createCjsBundles(
  entrypoints: { [name: string]: string },
  outFolder: string,
  sentryPluginOptions: Options,
  plugins: Bundlers[] = []
): void {
  if (plugins.length === 0 || plugins.includes("vite")) {
    void vite.build({
      clearScreen: false,
      build: {
        sourcemap: true,
        outDir: path.join(outFolder, "vite"),
        rollupOptions: {
          input: entrypoints,
          output: {
            format: "cjs",
            entryFileNames: "[name].js",
          },
        },
      },
      plugins: [sentryVitePlugin(sentryPluginOptions)],
    });
  }

  if (plugins.length === 0 || plugins.includes("rollup")) {
    void rollup
      .rollup({
        input: entrypoints,
        plugins: [sentryRollupPlugin(sentryPluginOptions)],
      })
      .then((bundle) =>
        bundle.write({
          sourcemap: true,
          dir: path.join(outFolder, "rollup"),
          format: "cjs",
          exports: "named",
        })
      );
  }

  if (plugins.length === 0 || plugins.includes("esbuild")) {
    void esbuild.build({
      sourcemap: true,
      entryPoints: entrypoints,
      outdir: path.join(outFolder, "esbuild"),
      plugins: [sentryEsbuildPlugin(sentryPluginOptions)],
      minify: true,
      bundle: true,
      format: "cjs",
    });
  }

  if (plugins.length === 0 || plugins.includes("webpack")) {
    webpack(
      {
        devtool: "source-map",
        cache: false,
        entry: entrypoints,
        output: {
          path: path.join(outFolder, "webpack"),
          library: {
            type: "commonjs",
          },
        },
        mode: "production",
        plugins: [sentryWebpackPlugin(sentryPluginOptions)],
      },
      (err) => {
        if (err) {
          throw err;
        }
      }
    );
  }
}
