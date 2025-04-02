import { SentryWebpackPluginOptions, sentryWebpackUnpluginFactory } from "./plugin";

const sentryUnplugin = sentryWebpackUnpluginFactory();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryWebpackPlugin: (options?: SentryWebpackPluginOptions) => any =
  sentryUnplugin.webpack;

export { sentryCliBinaryExists } from "@sentry/bundler-plugin-core";

export type { SentryWebpackPluginOptions };
