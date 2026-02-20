import * as vite from "vite";
import * as path from "path";
import * as rollup from "rollup";
import { webpack } from "webpack";
import * as esbuild from "esbuild";

import type { Options } from "@sentry/bundler-plugin-core";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { sentryWebpackPlugin } from "@sentry/webpack-plugin";
import { sentryEsbuildPlugin } from "@sentry/esbuild-plugin";
import { sentryRollupPlugin } from "@sentry/rollup-plugin";

export function createCjsBundles(
  entrypoints: { [name: string]: string },
  outFolder: string,
  sentryPluginOptions: Options
): void {
  if (!sentryPluginOptions.release) {
    console.error("Config has no release set, aborting");
    return;
  }

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
    plugins: [
      sentryVitePlugin({
        ...sentryPluginOptions,
        release: {
          name: `${sentryPluginOptions.release.name!}-vite`,
          uploadLegacySourcemaps: `${
            sentryPluginOptions.release.uploadLegacySourcemaps as string
          }/vite`,
        },
      }),
    ],
  });

  void rollup
    .rollup({
      input: entrypoints,
      plugins: [
        sentryRollupPlugin({
          ...sentryPluginOptions,
          release: {
            name: `${sentryPluginOptions.release.name!}-rollup`,
            uploadLegacySourcemaps: `${
              sentryPluginOptions.release.uploadLegacySourcemaps as string
            }/rollup`,
          },
        }),
      ],
    })
    .then((bundle) =>
      bundle.write({
        sourcemap: true,
        dir: path.join(outFolder, "rollup"),
        format: "cjs",
        exports: "named",
      })
    );

  void esbuild.build({
    entryPoints: entrypoints,
    outdir: path.join(outFolder, "esbuild"),
    sourcemap: true,
    plugins: [
      sentryEsbuildPlugin({
        ...sentryPluginOptions,
        release: {
          name: `${sentryPluginOptions.release.name!}-esbuild`,
          uploadLegacySourcemaps: `${
            sentryPluginOptions.release.uploadLegacySourcemaps as string
          }/esbuild`,
        },
      }),
    ],
    minify: true,
    bundle: true,
    format: "cjs",
  });

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
      plugins: [
        sentryWebpackPlugin({
          ...sentryPluginOptions,
          release: {
            name: `${sentryPluginOptions.release.name!}-webpack`,
            uploadLegacySourcemaps: `${
              sentryPluginOptions.release.uploadLegacySourcemaps as string
            }/webpack`,
          },
        }),
      ],
    },
    (err) => {
      if (err) {
        throw err;
      }
    }
  );
}
