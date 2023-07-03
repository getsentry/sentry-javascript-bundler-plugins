import {
  getDebugIdSnippet,
  Options,
  sentryUnpluginFactory,
  stringToUUID,
} from "@sentry/bundler-plugin-core";
import * as path from "path";
import { UnpluginOptions } from "unplugin";
import { v4 as uuidv4 } from "uuid";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore webpack is a peer dep
import * as webback4or5 from "webpack";

interface BannerPluginCallbackArg {
  chunk?: {
    hash?: string;
  };
}

function webpackReleaseInjectionPlugin(injectionCode: string): UnpluginOptions {
  return {
    name: "sentry-webpack-release-injection-plugin",
    webpack(compiler) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore webpack version compatibility shenanigans
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const BannerPlugin = compiler?.webpack?.BannerPlugin || webback4or5?.BannerPlugin;
      compiler.options.plugins = compiler.options.plugins || [];
      compiler.options.plugins.push(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
        new BannerPlugin({
          raw: true,
          include: /\.(js|ts|jsx|tsx|mjs|cjs)$/,
          banner: injectionCode,
        })
      );
    },
  };
}

function webpackDebugIdInjectionPlugin(): UnpluginOptions {
  return {
    name: "sentry-webpack-debug-id-injection-plugin",
    webpack(compiler) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore webpack version compatibility shenanigans
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const BannerPlugin = compiler?.webpack?.BannerPlugin || webback4or5?.BannerPlugin;
      compiler.options.plugins = compiler.options.plugins || [];
      compiler.options.plugins.push(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
        new BannerPlugin({
          raw: true,
          include: /\.(js|ts|jsx|tsx|mjs|cjs)$/,
          banner: (arg?: BannerPluginCallbackArg) => {
            const debugId = arg?.chunk?.hash ? stringToUUID(arg.chunk.hash) : uuidv4();
            return getDebugIdSnippet(debugId);
          },
        })
      );
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
      compiler.hooks.afterEmit.tapAsync(pluginName, (compilation, callback: () => void) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const outputPath = (compilation.outputOptions.path as string | undefined) ?? path.resolve();
        const buildArtifacts = Object.keys(compilation.assets as Record<string, unknown>).map(
          (asset) => path.join(outputPath, asset)
        );
        void upload(buildArtifacts).then(() => {
          callback();
        });
      });
    },
  };
}

function webpackModuleMetadataInjectionPlugin(injectionCode: string): UnpluginOptions {
  return {
    name: "sentry-webpack-module-metadata-injection-plugin",
    webpack(compiler) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore webpack version compatibility shenanigans
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const BannerPlugin = compiler?.webpack?.BannerPlugin || webback4or5?.BannerPlugin;
      compiler.options.plugins = compiler.options.plugins || [];
      compiler.options.plugins.push(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
        new BannerPlugin({
          raw: true,
          include: /\.(js|ts|jsx|tsx|mjs|cjs)$/,
          banner: injectionCode,
        })
      );
    },
  };
}

const sentryUnplugin = sentryUnpluginFactory({
  releaseInjectionPlugin: webpackReleaseInjectionPlugin,
  moduleMetadataInjectionPlugin: webpackModuleMetadataInjectionPlugin,
  debugIdInjectionPlugin: webpackDebugIdInjectionPlugin,
  debugIdUploadPlugin: webpackDebugIdUploadPlugin,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryWebpackPlugin: (options: Options) => any = sentryUnplugin.webpack;

export { sentryCliBinaryExists } from "@sentry/bundler-plugin-core";
export type { Options as SentryWebpackPluginOptions } from "@sentry/bundler-plugin-core";
