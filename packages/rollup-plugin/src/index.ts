import {
  sentryUnpluginFactory,
  Options,
  createRollupReleaseInjectionHooks,
  createRollupDebugIdInjectionHooks,
} from "@sentry/bundler-plugin-core";
import type { UnpluginOptions } from "unplugin";

/**
 * Rollup specific plugin to inject release values.
 */
function rollupReleaseInjectionPlugin(injectionCode: string): UnpluginOptions {
  return {
    name: "sentry-rollup-release-injection-plugin",
    rollup: createRollupReleaseInjectionHooks(injectionCode),
  };
}

/**
 * Rollup specific plugin to inject debug IDs.
 */
function rollupDebugIdInjectionPlugin(): UnpluginOptions {
  return {
    name: "sentry-rollup-debug-id-injection-plugin",
    rollup: createRollupDebugIdInjectionHooks(),
  };
}

const sentryUnplugin = sentryUnpluginFactory({
  releaseInjectionPlugin: rollupReleaseInjectionPlugin,
  debugIdInjectionPlugin: rollupDebugIdInjectionPlugin,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryRollupPlugin: (options: Options) => any = sentryUnplugin.rollup;

export type { Options as SentryRollupPluginOptions } from "@sentry/bundler-plugin-core";
export { sentryCliBinaryExists } from "@sentry/bundler-plugin-core";
