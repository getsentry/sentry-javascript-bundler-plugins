import { getDebugIdSnippet, Options, sentryUnpluginFactory } from "@sentry/bundler-plugin-core";
import { UnpluginOptions } from "unplugin";
import { v4 as uuidv4 } from "uuid";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore No typedefs for webpack 4
import { BannerPlugin as Webpack4BannerPlugin } from "webpack-4";

function webpackReleaseInjectionPlugin(injectionCode: string): UnpluginOptions {
  const pluginName = "sentry-webpack-release-injection-plugin";

  return {
    name: pluginName,

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
  const pluginName = "sentry-webpack-debug-id-injection-plugin";

  return {
    name: pluginName,

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

const sentryUnplugin = sentryUnpluginFactory({
  releaseInjectionPlugin: webpackReleaseInjectionPlugin,
  debugIdInjectionPlugin: webpackDebugIdInjectionPlugin,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryWebpackPlugin: (options: Options) => any = sentryUnplugin.webpack;

export { sentryCliBinaryExists } from "@sentry/bundler-plugin-core";
export type { Options as SentryWebpackPluginOptions } from "@sentry/bundler-plugin-core";
