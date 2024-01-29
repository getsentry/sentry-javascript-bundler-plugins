import * as vite from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";
import * as rollup from "rollup";
import { default as webpack4 } from "webpack4";
import { webpack as webpack5 } from "webpack5";
import esbuild from "esbuild019";
import { babel as babelPlugin } from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import type { Stats as Webpack5Stats } from "webpack5";
import type { Stats as Webpack4Stats } from "webpack4";
import { Options } from "@sentry/bundler-plugin-core";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { sentryWebpackPlugin } from "@sentry/webpack-plugin";
import { sentryEsbuildPlugin } from "@sentry/esbuild-plugin";
import { sentryRollupPlugin } from "@sentry/rollup-plugin";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const nodejsMajorversion = process.version.split(".")[0]!.slice(1);

export function createCjsBundles(
  entrypoints: { [name: string]: string },
  outFolder: string,
  sentryUnpluginOptions: Options,
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
      plugins: [react({ jsxRuntime: "automatic" }), sentryVitePlugin(sentryUnpluginOptions)],
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
          sentryRollupPlugin(sentryUnpluginOptions),
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
      plugins: [sentryEsbuildPlugin(sentryUnpluginOptions)],
      minify: true,
      bundle: true,
      jsx: "automatic",
      format: "cjs",
    });
  }

  // Webpack 4 doesn't work on Node.js versions >= 18
  if (parseInt(nodejsMajorversion) < 18 && (plugins.length === 0 || plugins.includes("webpack4"))) {
    webpack4(
      {
        mode: "production",
        entry: entrypoints,
        cache: false,
        optimization: {
          minimize: false,
        },
        resolve: {
          extensions: RESOLVABLE_EXTENSIONS,
        },
        output: {
          path: path.join(outFolder, "webpack4"),
          libraryTarget: "commonjs",
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
        target: "node", // needed for webpack 4 so we can access node api
        plugins: [sentryWebpackPlugin(sentryUnpluginOptions)],
      },
      handleWebpack
    );
  }

  if (plugins.length === 0 || plugins.includes("webpack5")) {
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
        plugins: [sentryWebpackPlugin(sentryUnpluginOptions)],
      },
      handleWebpack
    );
  }
}

const RESOLVABLE_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx"];
const RESOLVABLE_JSX_EXTENSIONS_REGEX = /\.?(j|t)sx$/;

function handleWebpack(err: Error | undefined, stats: Webpack4Stats | Webpack5Stats | undefined) {
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
