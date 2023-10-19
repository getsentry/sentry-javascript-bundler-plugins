import {
  sentryUnpluginFactory,
  Options,
  getDebugIdSnippet,
  SentrySDKBuildFlags,
  replaceBooleanFlagsInCode,
} from "@sentry/bundler-plugin-core";
import type { UnpluginOptions } from "unplugin";
import * as path from "path";
import * as fs from "fs";

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
  const stubNamespace = "sentry-debug-id-stub";

  return {
    name: pluginName,

    esbuild: {
      setup({ initialOptions, onLoad, onResolve }) {
        onResolve({ filter: /.*/ }, (args) => {
          if (args.kind !== "entry-point") {
            return;
          } else {
            // Injected modules via the esbuild `inject` option do also have `kind == "entry-point"`.
            // We do not want to inject debug IDs into those files because they are already bundled into the entrypoints
            if (initialOptions.inject?.includes(args.path)) {
              return;
            }

            return {
              pluginName,
              // needs to be an abs path, otherwise esbuild will complain
              path: path.isAbsolute(args.path) ? args.path : path.join(args.resolveDir, args.path),
              pluginData: {
                isProxyResolver: true,
                originalPath: args.path,
                originalResolveDir: args.resolveDir,
              },
              // We need to add a suffix here, otherwise esbuild will mark the entrypoint as resolved and won't traverse
              // the module tree any further down past the proxy module because we're essentially creating a dependency
              // loop back to the proxy module.
              // By setting a suffix we're telling esbuild that the entrypoint and proxy module are two different things,
              // making it re-resolve the entrypoint when it is imported from the proxy module.
              // Super confusing? Yes. Works? Apparently... Let's see.
              suffix: "?sentryProxyModule=true",
            };
          }
        });

        onLoad({ filter: /.*/ }, (args) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (!(args.pluginData?.isProxyResolver as undefined | boolean)) {
            return null;
          }

          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const originalPath = args.pluginData.originalPath as string;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const originalResolveDir = args.pluginData.originalResolveDir as string;

          return {
            loader: "js",
            pluginName,
            // We need to use JSON.stringify below so that any escape backslashes stay escape backslashes, in order not to break paths on windows
            contents: `
              import "_sentry-debug-id-injection-stub";
              import * as OriginalModule from ${JSON.stringify(originalPath)};
              export default OriginalModule.default;
              export * from ${JSON.stringify(originalPath)};`,
            resolveDir: originalResolveDir,
          };
        });

        onResolve({ filter: /_sentry-debug-id-injection-stub/ }, (args) => {
          return {
            path: args.path,
            sideEffects: true,
            pluginName,
            namespace: stubNamespace,
            suffix: "?sentry-module-id=" + uuidv4(), // create different module, each time this is resolved
          };
        });

        onLoad({ filter: /_sentry-debug-id-injection-stub/, namespace: stubNamespace }, () => {
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

function esbuildModuleMetadataInjectionPlugin(injectionCode: string): UnpluginOptions {
  const pluginName = "sentry-esbuild-module-metadata-injection-plugin";
  const stubNamespace = "sentry-module-metadata-stub";

  return {
    name: pluginName,

    esbuild: {
      setup({ initialOptions, onLoad, onResolve }) {
        onResolve({ filter: /.*/ }, (args) => {
          if (args.kind !== "entry-point") {
            return;
          } else {
            // Injected modules via the esbuild `inject` option do also have `kind == "entry-point"`.
            // We do not want to inject debug IDs into those files because they are already bundled into the entrypoints
            if (initialOptions.inject?.includes(args.path)) {
              return;
            }

            return {
              pluginName,
              // needs to be an abs path, otherwise esbuild will complain
              path: path.isAbsolute(args.path) ? args.path : path.join(args.resolveDir, args.path),
              pluginData: {
                isMetadataProxyResolver: true,
                originalPath: args.path,
                originalResolveDir: args.resolveDir,
              },
              // We need to add a suffix here, otherwise esbuild will mark the entrypoint as resolved and won't traverse
              // the module tree any further down past the proxy module because we're essentially creating a dependency
              // loop back to the proxy module.
              // By setting a suffix we're telling esbuild that the entrypoint and proxy module are two different things,
              // making it re-resolve the entrypoint when it is imported from the proxy module.
              // Super confusing? Yes. Works? Apparently... Let's see.
              suffix: "?sentryMetadataProxyModule=true",
            };
          }
        });

        onLoad({ filter: /.*/ }, (args) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (!(args.pluginData?.isMetadataProxyResolver as undefined | boolean)) {
            return null;
          }

          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const originalPath = args.pluginData.originalPath as string;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const originalResolveDir = args.pluginData.originalResolveDir as string;

          return {
            loader: "js",
            pluginName,
            // We need to use JSON.stringify below so that any escape backslashes stay escape backslashes, in order not to break paths on windows
            contents: `
              import "_sentry-module-metadata-injection-stub";
              import * as OriginalModule from ${JSON.stringify(originalPath)};
              export default OriginalModule.default;
              export * from ${JSON.stringify(originalPath)};`,
            resolveDir: originalResolveDir,
          };
        });

        onResolve({ filter: /_sentry-module-metadata-injection-stub/ }, (args) => {
          return {
            path: args.path,
            sideEffects: true,
            pluginName,
            namespace: stubNamespace,
            suffix: "?sentry-module-id=" + uuidv4(), // create different module, each time this is resolved
          };
        });

        onLoad(
          { filter: /_sentry-module-metadata-injection-stub/, namespace: stubNamespace },
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

function esbuildBundleSizeOptimizationsPlugin(values: SentrySDKBuildFlags): UnpluginOptions {
  return {
    name: "sentry-esbuild-bundle-size-optimizations-plugin",
    esbuild: {
      setup({ onLoad }) {
        onLoad({ filter: /./ }, async (args) => {
          const source = await fs.promises.readFile(args.path, "utf8");

          const contents = replaceBooleanFlagsInCode(source, values);

          if (!contents) {
            return null;
          }

          return { contents: contents.code, loader: "default" };
        });
      },
    },
  };
}

const sentryUnplugin = sentryUnpluginFactory({
  releaseInjectionPlugin: esbuildReleaseInjectionPlugin,
  debugIdInjectionPlugin: esbuildDebugIdInjectionPlugin,
  moduleMetadataInjectionPlugin: esbuildModuleMetadataInjectionPlugin,
  debugIdUploadPlugin: esbuildDebugIdUploadPlugin,
  bundleSizeOptimizationsPlugin: esbuildBundleSizeOptimizationsPlugin,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryEsbuildPlugin: (options: Options) => any = sentryUnplugin.esbuild;

export type { Options as SentryEsbuildPluginOptions } from "@sentry/bundler-plugin-core";
export { sentryCliBinaryExists } from "@sentry/bundler-plugin-core";
