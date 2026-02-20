import * as vite from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";
import * as rollup from "rollup";
import { webpack } from "webpack";
import esbuild from "esbuild019";
import { babel as babelPlugin } from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import type { Stats } from "webpack";
import { Options } from "@sentry/bundler-plugin-core";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { sentryWebpackPlugin } from "@sentry/webpack-plugin";
import { sentryEsbuildPlugin } from "@sentry/esbuild-plugin";
import { sentryRollupPlugin } from "@sentry/rollup-plugin";

export function createCjsBundles(
  entrypoints: { [name: string]: string },
  outFolder: string,
  sentryPluginOptions: Options,
  plugins: string[] = []
): void {
  if (plugins.length === 0 || plugins.includes("vite")) {
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
      plugins: [react({ jsxRuntime: "automatic" }), sentryVitePlugin(sentryPluginOptions)],
    });
  }
  if (plugins.length === 0 || plugins.includes("rollup")) {
    void rollup
      .rollup({
        input: entrypoints,
        plugins: [
          resolve({
            extensions: RESOLVABLE_EXTENSIONS,
          }),
          commonjs(),
          sentryRollupPlugin(sentryPluginOptions),
          babelPlugin({
            babelHelpers: "bundled",
            presets: [["@babel/preset-react", { runtime: "automatic" }]],
            extensions: RESOLVABLE_EXTENSIONS,
          }),
        ],
      })
      .then((bundle) =>
        bundle.write({
          dir: path.join(outFolder, "rollup"),
          format: "cjs",
          exports: "named",
        })
      );
  }

  if (plugins.length === 0 || plugins.includes("esbuild")) {
    void esbuild.build({
      entryPoints: entrypoints,
      outdir: path.join(outFolder, "esbuild"),
      plugins: [sentryEsbuildPlugin(sentryPluginOptions)],
      minify: true,
      bundle: true,
      jsx: "automatic",
      format: "cjs",
    });
  }

  if (plugins.length === 0 || plugins.includes("webpack")) {
    webpack(
      {
        cache: false,
        entry: entrypoints,
        output: {
          path: path.join(outFolder, "webpack"),
          library: {
            type: "commonjs",
          },
        },
        optimization: {
          minimize: false,
        },
        mode: "production",
        resolve: {
          extensions: RESOLVABLE_EXTENSIONS,
        },
        module: {
          rules: [
            {
              test: RESOLVABLE_JSX_EXTENSIONS_REGEX,
              exclude: /node_modules/,
              use: {
                loader: "babel-loader",
                options: {
                  presets: [["@babel/preset-react", { runtime: "automatic" }]],
                },
              },
            },
          ],
        },
        plugins: [sentryWebpackPlugin(sentryPluginOptions)],
      },
      handleWebpack
    );
  }
}

const RESOLVABLE_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx"];
const RESOLVABLE_JSX_EXTENSIONS_REGEX = /\.?(j|t)sx$/;

function handleWebpack(err: Error | undefined, stats: Stats | undefined) {
  if (err) {
    throw err;
  }

  const info = stats?.toJson();
  if (!stats || !info) return;

  if (stats.hasErrors()) {
    // eslint-disable-next-line no-console
    console.error(info.errors);
  }

  if (stats.hasWarnings()) {
    // eslint-disable-next-line no-console
    console.warn(info.warnings);
  }
}
