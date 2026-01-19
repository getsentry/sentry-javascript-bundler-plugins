import {
  sentryUnpluginFactory,
  Options,
  getDebugIdSnippet,
  SentrySDKBuildFlags,
} from "@sentry/bundler-plugin-core";
import type { Logger } from "@sentry/bundler-plugin-core";
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

/**
 * Shared set to track entry points that have been wrapped by the metadata plugin
 * This allows the debug ID plugin to know when an import is coming from a metadata proxy
 */
const metadataProxyEntryPoints = new Set<string>();

/**
 * Set to track which paths have already been wrapped with debug ID injection
 * This prevents the debug ID plugin from wrapping the same module multiple times
 */
const debugIdWrappedPaths = new Set<string>();

function esbuildDebugIdInjectionPlugin(logger: Logger): UnpluginOptions {
  const pluginName = "sentry-esbuild-debug-id-injection-plugin";
  const stubNamespace = "sentry-debug-id-stub";

  return {
    name: pluginName,

    esbuild: {
      setup({ initialOptions, onLoad, onResolve }) {
        // Clear state from previous builds (important for watch mode and test suites)
        debugIdWrappedPaths.clear();
        // Also clear metadataProxyEntryPoints here because if moduleMetadataInjectionPlugin
        // is not instantiated in this build (e.g., moduleMetadata was disabled), we don't
        // want stale entries from a previous build to affect the current one.
        metadataProxyEntryPoints.clear();

        if (!initialOptions.bundle) {
          logger.warn(
            "The Sentry esbuild plugin only supports esbuild with `bundle: true` being set in the esbuild build options. Esbuild will probably crash now. Sorry about that. If you need to upload sourcemaps without `bundle: true`, it is recommended to use Sentry CLI instead: https://docs.sentry.io/platforms/javascript/sourcemaps/uploading/cli/"
          );
        }

        onResolve({ filter: /.*/ }, (args) => {
          // Inject debug IDs into entry points and into imports from metadata proxy modules
          const isEntryPoint = args.kind === "entry-point";

          // Check if this import is coming from a metadata proxy module
          // The metadata plugin registers entry points it wraps in the shared Set
          // We need to strip the query string suffix because esbuild includes the suffix
          // (e.g., ?sentryMetadataProxyModule=true) in args.importer
          const importerPath = args.importer?.split("?")[0];
          const isImportFromMetadataProxy =
            args.kind === "import-statement" &&
            importerPath !== undefined &&
            metadataProxyEntryPoints.has(importerPath);

          if (!isEntryPoint && !isImportFromMetadataProxy) {
            return;
          }

          // Skip injecting debug IDs into modules specified in the esbuild `inject` option
          // since they're already part of the entry points
          if (initialOptions.inject?.includes(args.path)) {
            return;
          }

          const resolvedPath = path.isAbsolute(args.path)
            ? args.path
            : path.join(args.resolveDir, args.path);

          // Skip injecting debug IDs into paths that have already been wrapped
          if (debugIdWrappedPaths.has(resolvedPath)) {
            return;
          }
          debugIdWrappedPaths.add(resolvedPath);

          return {
            pluginName,
            // needs to be an abs path, otherwise esbuild will complain
            path: resolvedPath,
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
        // Clear state from previous builds (important for watch mode and test suites)
        metadataProxyEntryPoints.clear();

        onResolve({ filter: /.*/ }, (args) => {
          if (args.kind !== "entry-point") {
            return;
          } else {
            // Injected modules via the esbuild `inject` option do also have `kind == "entry-point"`.
            // We do not want to inject debug IDs into those files because they are already bundled into the entrypoints
            if (initialOptions.inject?.includes(args.path)) {
              return;
            }

            const resolvedPath = path.isAbsolute(args.path)
              ? args.path
              : path.join(args.resolveDir, args.path);

            // Register this entry point so the debug ID plugin knows to wrap imports from
            // this proxy module, this because the debug ID may run after the metadata plugin
            metadataProxyEntryPoints.add(resolvedPath);

            return {
              pluginName,
              // needs to be an abs path, otherwise esbuild will complain
              path: resolvedPath,
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
  upload: (buildArtifacts: string[]) => Promise<void>,
  _logger: Logger,
  createDependencyOnBuildArtifacts: () => () => void
): UnpluginOptions {
  const freeGlobalDependencyOnDebugIdSourcemapArtifacts = createDependencyOnBuildArtifacts();
  return {
    name: "sentry-esbuild-debug-id-upload-plugin",
    esbuild: {
      setup({ initialOptions, onEnd }) {
        initialOptions.metafile = true;
        onEnd(async (result) => {
          try {
            const buildArtifacts = result.metafile ? Object.keys(result.metafile.outputs) : [];
            await upload(buildArtifacts);
          } finally {
            freeGlobalDependencyOnDebugIdSourcemapArtifacts();
          }
        });
      },
    },
  };
}

function esbuildBundleSizeOptimizationsPlugin(
  replacementValues: SentrySDKBuildFlags
): UnpluginOptions {
  return {
    name: "sentry-esbuild-bundle-size-optimizations-plugin",
    esbuild: {
      setup({ initialOptions }) {
        const replacementStringValues: Record<string, string> = {};
        Object.entries(replacementValues).forEach(([key, value]) => {
          replacementStringValues[key] = JSON.stringify(value);
        });

        initialOptions.define = { ...initialOptions.define, ...replacementStringValues };
      },
    },
  };
}

const sentryUnplugin = sentryUnpluginFactory({
  injectionPlugin: {
    releaseInjectionPlugin: esbuildReleaseInjectionPlugin,
    debugIdInjectionPlugin: esbuildDebugIdInjectionPlugin,
    moduleMetadataInjectionPlugin: esbuildModuleMetadataInjectionPlugin,
  },
  debugIdUploadPlugin: esbuildDebugIdUploadPlugin,
  bundleSizeOptimizationsPlugin: esbuildBundleSizeOptimizationsPlugin,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryEsbuildPlugin: (options?: Options) => any = sentryUnplugin.esbuild;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default sentryUnplugin.esbuild as (options?: Options) => any;

export type { Options as SentryEsbuildPluginOptions } from "@sentry/bundler-plugin-core";
export { sentryCliBinaryExists } from "@sentry/bundler-plugin-core";
