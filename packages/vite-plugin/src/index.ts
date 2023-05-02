import {
  sentryUnpluginFactory,
  Options,
  createRollupReleaseInjectionHooks,
} from "@sentry/bundler-plugin-core";
import { UnpluginOptions } from "unplugin";

function viteReleaseInjectionPlugin(injectionCode: string): UnpluginOptions {
  return {
    name: "sentry-vite-release-injection-plugin",
    enforce: "pre" as const, // need this so that vite runs the resolveId hook
    vite: createRollupReleaseInjectionHooks(injectionCode),
  };
}

const sentryUnplugin = sentryUnpluginFactory({
  releaseInjectionPlugin: viteReleaseInjectionPlugin,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryVitePlugin: (options: Options) => any = sentryUnplugin.vite;

export type { Options as SentryVitePluginOptions } from "@sentry/bundler-plugin-core";
export { sentryCliBinaryExists } from "@sentry/bundler-plugin-core";
