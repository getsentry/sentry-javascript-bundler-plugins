import {
  getDebugIdSnippet,
  Options,
  sentryUnpluginFactory,
  stringToUUID,
  SentrySDKBuildFlags,
  createComponentNameAnnotateHooks,
  Logger,
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
      const BannerPlugin =
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore webpack version compatibility shenanigans
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        compiler?.webpack?.BannerPlugin ||
        webback4or5?.BannerPlugin ||
        webback4or5?.default?.BannerPlugin;
      compiler.options.plugins = compiler.options.plugins || [];
      compiler.options.plugins.push(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
        new BannerPlugin({
          raw: true,
          include: /\.(js|ts|jsx|tsx|mjs|cjs)(\?[^?]*)?(#[^#]*)?$/,
          banner: injectionCode,
        })
      );
    },
  };
}

function webpackComponentNameAnnotatePlugin(ignoredComponents?: string[]): UnpluginOptions {
  return {
    name: "sentry-webpack-component-name-annotate-plugin",
    enforce: "pre",
    // Webpack needs this hook for loader logic, so the plugin is not run on unsupported file types
    transformInclude(id) {
      return id.endsWith(".tsx") || id.endsWith(".jsx");
    },
    transform: createComponentNameAnnotateHooks(ignoredComponents).transform,
  };
}

function webpackBundleSizeOptimizationsPlugin(
  replacementValues: SentrySDKBuildFlags
): UnpluginOptions {
  return {
    name: "sentry-webpack-bundle-size-optimizations-plugin",
    webpack(compiler) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore webpack version compatibility shenanigans
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const DefinePlugin =
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore webpack version compatibility shenanigans
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        compiler?.webpack?.DefinePlugin ||
        webback4or5?.DefinePlugin ||
        webback4or5?.default?.DefinePlugin;
      compiler.options.plugins = compiler.options.plugins || [];
      compiler.options.plugins.push(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
        new DefinePlugin({
          ...replacementValues,
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
      const BannerPlugin =
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore webpack version compatibility shenanigans
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        compiler?.webpack?.BannerPlugin ||
        webback4or5?.BannerPlugin ||
        webback4or5?.default?.BannerPlugin;
      compiler.options.plugins = compiler.options.plugins || [];
      compiler.options.plugins.push(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
        new BannerPlugin({
          raw: true,
          include: /\.(js|ts|jsx|tsx|mjs|cjs)(\?[^?]*)?(#[^#]*)?$/,
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
  upload: (buildArtifacts: string[]) => Promise<void>,
  logger: Logger
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

      compiler.hooks.done.tap(pluginName, () => {
        setTimeout(() => {
          logger.debug("Exiting process after debug file upload");
          process.exit(0);
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
      const BannerPlugin =
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore webpack version compatibility shenanigans
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        compiler?.webpack?.BannerPlugin ||
        webback4or5?.BannerPlugin ||
        webback4or5?.default?.BannerPlugin;
      compiler.options.plugins = compiler.options.plugins || [];
      compiler.options.plugins.push(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
        new BannerPlugin({
          raw: true,
          include: /\.(js|ts|jsx|tsx|mjs|cjs)(\?[^?]*)?(#[^#]*)?$/,
          banner: injectionCode,
        })
      );
    },
  };
}

const sentryUnplugin = sentryUnpluginFactory({
  releaseInjectionPlugin: webpackReleaseInjectionPlugin,
  componentNameAnnotatePlugin: webpackComponentNameAnnotatePlugin,
  moduleMetadataInjectionPlugin: webpackModuleMetadataInjectionPlugin,
  debugIdInjectionPlugin: webpackDebugIdInjectionPlugin,
  debugIdUploadPlugin: webpackDebugIdUploadPlugin,
  bundleSizeOptimizationsPlugin: webpackBundleSizeOptimizationsPlugin,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryWebpackPlugin: (options?: Options) => any = sentryUnplugin.webpack;

export { sentryCliBinaryExists } from "@sentry/bundler-plugin-core";
export type { Options as SentryWebpackPluginOptions } from "@sentry/bundler-plugin-core";
