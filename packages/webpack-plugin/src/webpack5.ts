import { SentryWebpackPluginOptions, sentryWebpackUnpluginFactory } from "./webpack4and5";

const sentryUnplugin = sentryWebpackUnpluginFactory();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryWebpackPlugin: (options?: SentryWebpackPluginOptions) => any =
  sentryUnplugin.webpack;

export { sentryCliBinaryExists } from "@sentry/bundler-plugin-core";

export type { SentryWebpackPluginOptions };
