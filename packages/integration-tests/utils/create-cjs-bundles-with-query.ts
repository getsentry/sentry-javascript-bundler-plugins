import * as vite from "vite";
import * as path from "path";
import * as rollup from "rollup";
import { webpack } from "webpack";
import { Options } from "@sentry/bundler-plugin-core";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { sentryWebpackPlugin } from "@sentry/webpack-plugin";
import { sentryRollupPlugin } from "@sentry/rollup-plugin";

export function createCjsBundlesWithQueryParam(
  entrypoints: { [name: string]: string },
  outFolder: string,
  sentryPluginOptions: Options,
  plugins: string[] = []
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
            entryFileNames: "[name].js?foo=bar#baz",
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
          entryFileNames: "[name].js?foo=bar#baz",
        })
      );
  }

  if (plugins.length === 0 || plugins.includes("esbuild")) {
    // esbuild doesn't have an option to add a query param
  }

  if (plugins.length === 0 || plugins.includes("webpack")) {
    webpack(
      {
        devtool: "source-map",
        cache: false,
        entry: entrypoints,
        output: {
          path: path.join(outFolder, "webpack"),
          filename: "[name].js?foo=bar#baz", // For some weird reason, the query param is not actually put to disk but the "virtual" behaviour we want to test still applies
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
