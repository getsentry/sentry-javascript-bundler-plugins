import {
  Options,
  sentryUnpluginFactory,
  stringToUUID,
  SentrySDKBuildFlags,
  createComponentNameAnnotateHooks,
  Logger,
  CodeInjection,
  getDebugIdSnippet,
} from "@sentry/bundler-plugin-core";
import * as path from "path";
import { UnpluginOptions } from "unplugin";
import { v4 as uuidv4 } from "uuid";

// since webpack 5.1 compiler contains webpack module so plugins always use correct webpack version
// https://github.com/webpack/webpack/commit/65eca2e529ce1d79b79200d4bdb1ce1b81141459

interface BannerPluginCallbackArg {
  chunk?: {
    hash?: string;
    contentHash?: {
      javascript?: string;
    };
  };
}

type UnsafeBannerPlugin = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (options: any): unknown;
};

type UnsafeDefinePlugin = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (options: any): unknown;
};

function webpackInjectionPlugin(
  UnsafeBannerPlugin: UnsafeBannerPlugin | undefined
): (injectionCode: CodeInjection, debugIds: boolean) => UnpluginOptions {
  return (injectionCode: CodeInjection, debugIds: boolean): UnpluginOptions => ({
    name: "sentry-webpack-injection-plugin",
    webpack(compiler) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore webpack version compatibility shenanigans
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const BannerPlugin =
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore webpack version compatibility shenanigans
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        compiler?.webpack?.BannerPlugin || UnsafeBannerPlugin;

      compiler.options.plugins = compiler.options.plugins || [];
      compiler.options.plugins.push(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
        new BannerPlugin({
          raw: true,
          include: /\.(js|ts|jsx|tsx|mjs|cjs)(\?[^?]*)?(#[^#]*)?$/,
          banner: (arg?: BannerPluginCallbackArg) => {
            const codeToInject = injectionCode.clone();
            if (debugIds) {
              const hash = arg?.chunk?.contentHash?.javascript ?? arg?.chunk?.hash;
              const debugId = hash ? stringToUUID(hash) : uuidv4();
              codeToInject.append(getDebugIdSnippet(debugId));
            }
            return codeToInject.code();
          },
        })
      );
    },
  });
}

function webpackComponentNameAnnotatePlugin(): (ignoredComponents?: string[]) => UnpluginOptions {
  return (ignoredComponents?: string[]) => ({
    name: "sentry-webpack-component-name-annotate-plugin",
    enforce: "pre",
    // Webpack needs this hook for loader logic, so the plugin is not run on unsupported file types
    transformInclude(id) {
      return id.endsWith(".tsx") || id.endsWith(".jsx");
    },
    transform: createComponentNameAnnotateHooks(ignoredComponents).transform,
  });
}

function webpackBundleSizeOptimizationsPlugin(
  UnsafeDefinePlugin: UnsafeDefinePlugin | undefined
): (replacementValues: SentrySDKBuildFlags) => UnpluginOptions {
  return (replacementValues: SentrySDKBuildFlags) => ({
    name: "sentry-webpack-bundle-size-optimizations-plugin",
    webpack(compiler) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore webpack version compatibility shenanigans
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const DefinePlugin =
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore webpack version compatibility shenanigans
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        compiler?.webpack?.DefinePlugin || UnsafeDefinePlugin;

      compiler.options.plugins = compiler.options.plugins || [];
      compiler.options.plugins.push(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
        new DefinePlugin({
          ...replacementValues,
        })
      );
    },
  });
}

function webpackDebugIdUploadPlugin(
  upload: (buildArtifacts: string[]) => Promise<void>,
  logger: Logger,
  createDependencyOnBuildArtifacts: () => () => void,
  forceExitOnBuildCompletion?: boolean
): UnpluginOptions {
  const pluginName = "sentry-webpack-debug-id-upload-plugin";
  return {
    name: pluginName,
    webpack(compiler) {
      const freeGlobalDependencyOnDebugIdSourcemapArtifacts = createDependencyOnBuildArtifacts();

      compiler.hooks.afterEmit.tapAsync(pluginName, (compilation, callback: () => void) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const outputPath = (compilation.outputOptions.path as string | undefined) ?? path.resolve();
        const buildArtifacts = Object.keys(compilation.assets as Record<string, unknown>).map(
          (asset) => path.join(outputPath, asset)
        );
        void upload(buildArtifacts)
          .then(() => {
            callback();
          })
          .finally(() => {
            freeGlobalDependencyOnDebugIdSourcemapArtifacts();
          });
      });

      if (forceExitOnBuildCompletion && compiler.options.mode === "production") {
        compiler.hooks.done.tap(pluginName, () => {
          setTimeout(() => {
            logger.debug("Exiting process after debug file upload");
            process.exit(0);
          });
        });
      }
    },
  };
}

/**
 * The factory function accepts BannerPlugin and DefinePlugin classes in
 * order to avoid direct dependencies on webpack.
 *
 * This allow us to export version of the plugin for webpack 5.1+ and compatible environments.
 *
 * Since webpack 5.1 compiler contains webpack module so plugins always use correct webpack version.
 */
export function sentryWebpackUnpluginFactory({
  BannerPlugin,
  DefinePlugin,
}: {
  BannerPlugin?: UnsafeBannerPlugin;
  DefinePlugin?: UnsafeDefinePlugin;
} = {}): ReturnType<typeof sentryUnpluginFactory> {
  return sentryUnpluginFactory({
    injectionPlugin: webpackInjectionPlugin(BannerPlugin),
    componentNameAnnotatePlugin: webpackComponentNameAnnotatePlugin(),
    debugIdUploadPlugin: webpackDebugIdUploadPlugin,
    bundleSizeOptimizationsPlugin: webpackBundleSizeOptimizationsPlugin(DefinePlugin),
  });
}

export type SentryWebpackPluginOptions = Options & {
  _experiments?: Options["_experiments"] & {
    /**
     * If enabled, the webpack plugin will exit the build process after the build completes.
     * Use this with caution, as it will terminate the process.
     *
     * More information: https://github.com/getsentry/sentry-javascript-bundler-plugins/issues/345
     *
     * @default false
     */
    forceExitOnBuildCompletion?: boolean;
  };
};
