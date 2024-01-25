import * as vite from "vite";
import * as path from "path";
import * as rollup from "rollup";
import { default as webpack4 } from "webpack4";
import { webpack as webpack5 } from "webpack5";
import * as esbuild from "esbuild";
import { babel as babelPlugin } from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
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
      plugins: [sentryVitePlugin(sentryUnpluginOptions)],
    });
  }
  if (plugins.length === 0 || plugins.includes("rollup")) {
    void rollup
      .rollup({
        input: entrypoints,
        plugins: [
          resolve({
            extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
          }),
          commonjs(),
          babelPlugin({
            babelHelpers: "bundled",
            presets: ["@babel/preset-react"],
            extensions: [".js", ".jsx", ".ts", ".tsx"],
          }),
          sentryRollupPlugin(sentryUnpluginOptions),
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
        mode: "production",
        plugins: [sentryWebpackPlugin(sentryUnpluginOptions)],
      },
      (err, stats) => {
        if (err) {
          throw err;
        }

        const info = stats?.toJson();
        if (!stats || !info) return;

        if (stats.hasErrors()) {
          console.error(info.errors);
        }

        if (stats.hasWarnings()) {
          console.warn(info.warnings);
        }
      }
    );
  }
}
