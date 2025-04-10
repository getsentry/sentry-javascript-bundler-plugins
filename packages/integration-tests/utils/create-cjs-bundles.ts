import * as vite3 from "vite";
import * as path from "path";
import * as rollup3 from "rollup";
import { default as webpack4 } from "webpack4";
import { webpack as webpack5 } from "webpack5";
import * as esbuild from "esbuild";
import { Options } from "@sentry/bundler-plugin-core";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { sentryWebpackPlugin } from "@sentry/webpack-plugin";
import { sentryEsbuildPlugin } from "@sentry/esbuild-plugin";
import { sentryRollupPlugin } from "@sentry/rollup-plugin";

const [NODE_MAJOR_VERSION] = process.version.split(".").map(Number) as [number];

type Bundlers =
  | "webpack4"
  | "webpack5"
  | "esbuild"
  | "rollup"
  | "rollup4"
  | "vite"
  | "vite6"
  | string;

export function createCjsBundles(
  entrypoints: { [name: string]: string },
  outFolder: string,
  sentryUnpluginOptions: Options,
  plugins: Bundlers[] = []
): void {
  if (plugins.length === 0 || plugins.includes("vite")) {
    void vite3.build({
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
      plugins: [sentryVitePlugin(sentryUnpluginOptions)],
    });
  }

  if (NODE_MAJOR_VERSION >= 18 && (plugins.length === 0 || plugins.includes("vite6"))) {
    // We can't import this at the top of the file because they are not
    // compatible with Node v14
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const vite6 = require("vite6") as typeof vite3;
    void vite6.build({
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
      plugins: [sentryVitePlugin(sentryUnpluginOptions)],
    });
  }

  if (plugins.length === 0 || plugins.includes("rollup")) {
    void rollup3
      .rollup({
        input: entrypoints,
        plugins: [sentryRollupPlugin(sentryUnpluginOptions)],
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

  if (NODE_MAJOR_VERSION >= 18 && (plugins.length === 0 || plugins.includes("rollup4"))) {
    // We can't import this at the top of the file because they are not
    // compatible with Node v14
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rollup4 = require("rollup4") as typeof rollup3;
    void rollup4
      .rollup({
        input: entrypoints,
        plugins: [sentryRollupPlugin(sentryUnpluginOptions)],
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
      plugins: [sentryEsbuildPlugin(sentryUnpluginOptions)],
      minify: true,
      bundle: true,
      format: "cjs",
    });
  }

  // Webpack 4 doesn't work on Node.js versions >= 18
  if (NODE_MAJOR_VERSION < 18 && (plugins.length === 0 || plugins.includes("webpack4"))) {
    webpack4(
      {
        devtool: "source-map",
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
        devtool: "source-map",
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
}
