import { sentryUnpluginFactory, Options, getDebugIdSnippet } from "@sentry/bundler-plugin-core";
import type { UnpluginOptions } from "unplugin";

import { v4 as uuidv4 } from "uuid";

function esbuildReleaseInjectionPlugin(injectionCode: string): UnpluginOptions {
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

function esbuildDebugIdInjectionPlugin(): UnpluginOptions {
  const pluginName = "sentry-esbuild-debug-id-injection-plugin";
  const virtualReleaseInjectionFilePath = "_sentry-debug-id-injection-file";

  const debugIdSnippet = getDebugIdSnippet(uuidv4());

  return {
    name: pluginName,

    esbuild: {
      setup({ initialOptions, onLoad }) {
        initialOptions.inject = initialOptions.inject || [];
        initialOptions.inject.push(virtualReleaseInjectionFilePath);

        onLoad(
          {
            filter: /_sentry-debug-id-injection-file$/,
          },
          () => {
            return {
              loader: "js",
              pluginName,
              contents: debugIdSnippet,
            };
          }
        );
      },
    },
  };
}

const sentryUnplugin = sentryUnpluginFactory({
  releaseInjectionPlugin: esbuildReleaseInjectionPlugin,
  debugIdInjectionPlugin: esbuildDebugIdInjectionPlugin,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryEsbuildPlugin: (options: Options) => any = sentryUnplugin.esbuild;

export type { Options as SentryEsbuildPluginOptions } from "@sentry/bundler-plugin-core";
export { sentryCliBinaryExists } from "@sentry/bundler-plugin-core";
