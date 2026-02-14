import * as vite from "vite";
import * as path from "path";
import * as rollup from "rollup";
import { default as webpack4 } from "webpack4";
import { webpack as webpack5 } from "webpack5";
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
      plugins: [
        sentryWebpackPlugin({
          ...sentryPluginOptions,
          release: {
            name: `${sentryPluginOptions.release.name!}-webpack4`,
            uploadLegacySourcemaps: `${
              sentryPluginOptions.release.uploadLegacySourcemaps as string
            }/webpack4`,
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
      plugins: [
        sentryWebpackPlugin({
          ...sentryPluginOptions,
          release: {
            name: `${sentryPluginOptions.release.name!}-webpack5`,
            uploadLegacySourcemaps: `${
              sentryPluginOptions.release.uploadLegacySourcemaps as string
            }/webpack5`,
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
