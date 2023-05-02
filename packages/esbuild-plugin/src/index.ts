import { sentryUnpluginFactory, Options } from "@sentry/bundler-plugin-core";
import type { UnpluginOptions } from "unplugin";

/**
 * Esbuild specific plugin to inject release values.
 *
 * This plugin works by pointing esbuild's inject option to a virtual file that
 * we load and fill with release injection code.
 */
export function esbuildReleaseInjectionPlugin(injectionCode: string): UnpluginOptions {
  const pluginName = "sentry-esbuild-release-injection-plugin";
  const virtualReleaseInjectionFilePath = "_sentry-release-injection-file";

  return {
    name: pluginName,

    esbuild: {
      setup({ initialOptions, onLoad }) {
        initialOptions.inject = initialOptions.inject || [];
        initialOptions.inject.push(virtualReleaseInjectionFilePath);

        onLoad(
          {
            filter: /_sentry-release-injection-file$/,
          },
          () => {
            return {
              loader: "js",
              pluginName,
              contents: injectionCode,
            };
          }
        );
      },
    },
  };
}

const sentryUnplugin = sentryUnpluginFactory({
  releaseInjectionPlugin: esbuildReleaseInjectionPlugin,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryEsbuildPlugin: (options: Options) => any = sentryUnplugin.esbuild;

export type { Options as SentryEsbuildPluginOptions } from "@sentry/bundler-plugin-core";
export { sentryCliBinaryExists } from "@sentry/bundler-plugin-core";
