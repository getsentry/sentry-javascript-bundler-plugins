import {
  sentryUnpluginFactory,
  Options,
  createRollupReleaseInjectionHooks,
  createRollupDebugIdInjectionHooks,
} from "@sentry/bundler-plugin-core";
import { UnpluginOptions } from "unplugin";

function viteReleaseInjectionPlugin(injectionCode: string): UnpluginOptions {
  return {
    name: "sentry-vite-release-injection-plugin",
    enforce: "pre" as const, // need this so that vite runs the resolveId hook
    vite: createRollupReleaseInjectionHooks(injectionCode),
  };
}

/**
 * Rollup specific plugin to inject debug IDs.
 */
function viteDebugIdInjectionPlugin(): UnpluginOptions {
  return {
    name: "sentry-vite-debug-id-injection-plugin",
    rollup: createRollupDebugIdInjectionHooks(),
  };
}

const sentryUnplugin = sentryUnpluginFactory({
  releaseInjectionPlugin: viteReleaseInjectionPlugin,
  debugIdInjectionPlugin: viteDebugIdInjectionPlugin,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryVitePlugin: (options: Options) => any = sentryUnplugin.vite;

export type { Options as SentryVitePluginOptions } from "@sentry/bundler-plugin-core";
export { sentryCliBinaryExists } from "@sentry/bundler-plugin-core";
