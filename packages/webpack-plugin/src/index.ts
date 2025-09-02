import { SentryWebpackPluginOptions, sentryWebpackUnpluginFactory } from "./webpack4and5";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore webpack is a peer dep
import * as webpack4or5 from "webpack";

const BannerPlugin = webpack4or5?.BannerPlugin || webpack4or5?.default?.BannerPlugin;

const DefinePlugin = webpack4or5?.DefinePlugin || webpack4or5?.default?.DefinePlugin;

const sentryUnplugin = sentryWebpackUnpluginFactory({
  BannerPlugin,
  DefinePlugin,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryWebpackPlugin: (options?: SentryWebpackPluginOptions) => any =
  sentryUnplugin.webpack;

export { sentryCliBinaryExists } from "@sentry/bundler-plugin-core";

export type { SentryWebpackPluginOptions };
