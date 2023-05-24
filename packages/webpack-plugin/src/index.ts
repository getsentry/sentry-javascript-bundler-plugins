import { getDebugIdSnippet, Options, sentryUnpluginFactory } from "@sentry/bundler-plugin-core";
import * as path from "path";
import { UnpluginOptions } from "unplugin";
import { v4 as uuidv4 } from "uuid";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore No typedefs for webpack 4
import { BannerPlugin as Webpack4BannerPlugin } from "webpack-4";

function webpackReleaseInjectionPlugin(injectionCode: string): UnpluginOptions {
  return {
    name: "sentry-webpack-release-injection-plugin",
    webpack(compiler) {
      if (compiler?.webpack?.BannerPlugin) {
        compiler.options.plugins.push(
          new compiler.webpack.BannerPlugin({
            raw: true,
            include: /\.(js|ts|jsx|tsx|mjs|cjs)$/,
            banner: injectionCode,
          })
        );
      } else {
        compiler.options.plugins.push(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
          new Webpack4BannerPlugin({
            raw: true,
            include: /\.(js|ts|jsx|tsx|mjs|cjs)$/,
            banner: injectionCode,
          })
        );
      }
    },
  };
}

function webpackDebugIdInjectionPlugin(): UnpluginOptions {
  return {
    name: "sentry-webpack-debug-id-injection-plugin",
    webpack(compiler) {
      if (compiler?.webpack?.BannerPlugin) {
        compiler.options.plugins.push(
          new compiler.webpack.BannerPlugin({
            raw: true,
            include: /\.(js|ts|jsx|tsx|mjs|cjs)$/,
            banner: () => getDebugIdSnippet(uuidv4()),
          })
        );
      } else {
        compiler.options.plugins.push(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
          new Webpack4BannerPlugin({
            raw: true,
            include: /\.(js|ts|jsx|tsx|mjs|cjs)$/,
            banner: () => getDebugIdSnippet(uuidv4()),
          })
        );
      }
    },
  };
}

function webpackDebugIdUploadPlugin(
  upload: (buildArtifacts: string[]) => Promise<void>
): UnpluginOptions {
  const pluginName = "sentry-webpack-debug-id-upload-plugin";
  return {
    name: pluginName,
    webpack(compiler) {
      compiler.hooks.afterEmit.tapAsync(pluginName, (compilation, callback) => {
        const outputPath = compilation.outputOptions.path ?? path.resolve();
        const buildArtifacts = Object.keys(compilation.assets).map((asset) =>
          path.join(outputPath, asset)
        );
        void upload(buildArtifacts).then(() => {
          callback();
        });
      });
    },
  };
}

const sentryUnplugin = sentryUnpluginFactory({
  releaseInjectionPlugin: webpackReleaseInjectionPlugin,
  debugIdInjectionPlugin: webpackDebugIdInjectionPlugin,
  debugIdUploadPlugin: webpackDebugIdUploadPlugin,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryWebpackPlugin: (options: Options) => any = sentryUnplugin.webpack;

export { sentryCliBinaryExists } from "@sentry/bundler-plugin-core";
export type { Options as SentryWebpackPluginOptions } from "@sentry/bundler-plugin-core";
