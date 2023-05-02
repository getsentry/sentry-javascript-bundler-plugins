import {
  sentryUnpluginFactory,
  Options,
  createRollupReleaseInjectionHooks,
} from "@sentry/bundler-plugin-core";
import type { UnpluginOptions } from "unplugin";

/**
 * Rollup specific plugin to inject release values.
 *
 * This plugin works by creating a virtual module containing the injection which we then from every user module.
 */
export function rollupReleaseInjectionPlugin(injectionCode: string): UnpluginOptions {
  return {
    name: "sentry-rollup-release-injection-plugin",
    rollup: createRollupReleaseInjectionHooks(injectionCode),
  };
}

const sentryUnplugin = sentryUnpluginFactory({
  releaseInjectionPlugin: rollupReleaseInjectionPlugin,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryRollupPlugin: (options: Options) => any = sentryUnplugin.rollup;

export type { Options as SentryRollupPluginOptions } from "@sentry/bundler-plugin-core";
export { sentryCliBinaryExists } from "@sentry/bundler-plugin-core";
