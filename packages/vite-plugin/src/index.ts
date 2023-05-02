import { sentryUnpluginFactory, Options } from "@sentry/bundler-plugin-core";

const sentryUnplugin = sentryUnpluginFactory();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryVitePlugin: (options: Options) => any = sentryUnplugin.vite;

export type { Options as SentryVitePluginOptions } from "@sentry/bundler-plugin-core";
export { sentryCliBinaryExists } from "@sentry/bundler-plugin-core";
