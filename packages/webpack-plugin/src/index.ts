import { SentryWebpackPluginOptions, sentryWebpackUnpluginFactory } from "./webpack4and5";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore webpack is a peer dep
import * as webpack4or5 from "webpack";

const BannerPlugin = webpack4or5?.BannerPlugin || webpack4or5?.default?.BannerPlugin;

const DefinePlugin = webpack4or5?.DefinePlugin || webpack4or5?.default?.DefinePlugin;

// Detect webpack major version for telemetry (helps differentiate webpack 4 vs 5 usage)
function getWebpackMajorVersion(): string | undefined {
  try {
    const webpack = webpack4or5 as unknown as { version?: string; default?: { version?: string } } | undefined;
    const version = webpack?.version ?? webpack?.default?.version;
    const webpackMajorVersion = version?.split(".")[0]; // "4" or "5"
    return webpackMajorVersion;
  } catch (error) {
    return undefined
  }
}

const webpackMajorVersion = getWebpackMajorVersion();

const sentryUnplugin = sentryWebpackUnpluginFactory({
  BannerPlugin,
  DefinePlugin,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryWebpackPlugin: (options?: SentryWebpackPluginOptions) => any = (options) => {
  const enhancedOptions: SentryWebpackPluginOptions = {
    ...options,
    _metaOptions: {
      ...options?._metaOptions,
      telemetry: {
        ...options?._metaOptions?.telemetry,
        bundlerMajorVersion:
          options?._metaOptions?.telemetry?.bundlerMajorVersion ?? webpackMajorVersion,
      },
    },
  };
  return sentryUnplugin.webpack(enhancedOptions);
};

export { sentryCliBinaryExists } from "@sentry/bundler-plugin-core";

export type { SentryWebpackPluginOptions };
