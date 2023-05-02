import { sentryUnpluginFactory, Options } from "@sentry/bundler-plugin-core";

const sentryUnplugin = sentryUnpluginFactory();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryWebpackPlugin: (options: Options) => any = sentryUnplugin.webpack;

export type { Options as SentryWebpackPluginOptions } from "@sentry/bundler-plugin-core";
export { sentryCliBinaryExists } from "@sentry/bundler-plugin-core";
