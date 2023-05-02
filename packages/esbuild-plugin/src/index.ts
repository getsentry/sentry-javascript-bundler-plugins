import { sentryUnpluginFactory, Options } from "@sentry/bundler-plugin-core";

const sentryUnplugin = sentryUnpluginFactory();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryEsbuildPlugin: (options: Options) => any = sentryUnplugin.esbuild;

export type { Options as SentryEsbuildPluginOptions } from "@sentry/bundler-plugin-core";
export { sentryCliBinaryExists } from "@sentry/bundler-plugin-core";
