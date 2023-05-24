import { sentryUnpluginFactory, Options, getDebugIdSnippet } from "@sentry/bundler-plugin-core";
import type { UnpluginOptions } from "unplugin";
import * as path from "path";

import { v4 as uuidv4 } from "uuid";

function esbuildReleaseInjectionPlugin(injectionCode: string): UnpluginOptions {
  const pluginName = "sentry-esbuild-release-injection-plugin";
  const virtualReleaseInjectionFilePath = path.resolve("_sentry-release-injection-stub"); // needs to be an absolute path for older eslint versions

  return {
    name: pluginName,

    esbuild: {
      setup({ initialOptions, onLoad, onResolve }) {
        initialOptions.inject = initialOptions.inject || [];
        initialOptions.inject.push(virtualReleaseInjectionFilePath);

        onResolve({ filter: /_sentry-release-injection-stub/ }, (args) => {
          return {
            path: args.path,
            sideEffects: true,
            pluginName,
          };
        });

        onLoad({ filter: /_sentry-release-injection-stub/ }, () => {
          return {
            loader: "js",
            pluginName,
            contents: injectionCode,
          };
        });
      },
    },
  };
}

function esbuildDebugIdInjectionPlugin(): UnpluginOptions {
  const pluginName = "sentry-esbuild-debug-id-injection-plugin";
  const virtualReleaseInjectionFilePath = path.resolve("_sentry-debug-id-injection-stub"); // needs to be an absolute path for older eslint versions

  return {
    name: pluginName,

    esbuild: {
      setup({ initialOptions, onLoad, onResolve }) {
        initialOptions.inject = initialOptions.inject || [];
        initialOptions.inject.push(virtualReleaseInjectionFilePath);

        onResolve({ filter: /_sentry-debug-id-injection-stub/ }, (args) => {
          return {
            path: args.path,
            sideEffects: true,
            pluginName,
            suffix: "?sentry-module-id=" + uuidv4(), // create different module, each time this is resolved
          };
        });

        onLoad({ filter: /_sentry-debug-id-injection-stub/ }, () => {
          return {
            loader: "js",
            pluginName,
            contents: getDebugIdSnippet(uuidv4()),
          };
        });
      },
    },
  };
}

function esbuildDebugIdUploadPlugin(
  upload: (buildArtifacts: string[]) => Promise<void>
): UnpluginOptions {
  return {
    name: "sentry-esbuild-debug-id-upload-plugin",
    esbuild: {
      setup({ initialOptions, onEnd }) {
        initialOptions.metafile = true;
        onEnd(async (result) => {
          const buildArtifacts = result.metafile ? Object.keys(result.metafile.outputs) : [];
          await upload(buildArtifacts);
        });
      },
    },
  };
}

const sentryUnplugin = sentryUnpluginFactory({
  releaseInjectionPlugin: esbuildReleaseInjectionPlugin,
  debugIdInjectionPlugin: esbuildDebugIdInjectionPlugin,
  debugIdUploadPlugin: esbuildDebugIdUploadPlugin,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryEsbuildPlugin: (options: Options) => any = sentryUnplugin.esbuild;

export type { Options as SentryEsbuildPluginOptions } from "@sentry/bundler-plugin-core";
export { sentryCliBinaryExists } from "@sentry/bundler-plugin-core";
