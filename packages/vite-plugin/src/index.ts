import {
  sentryUnpluginFactory,
  Options,
  createRollupReleaseInjectionHooks,
  createRollupModuleMetadataInjectionHooks,
  createRollupDebugIdInjectionHooks,
  createRollupDebugIdUploadHooks,
  SentrySDKBuildFlags,
  createRollupBundleSizeOptimizationHooks,
  createRollupReactAnnotateHooks,
} from "@sentry/bundler-plugin-core";
import { UnpluginOptions } from "unplugin";

function viteReleaseInjectionPlugin(injectionCode: string): UnpluginOptions {
  return {
    name: "sentry-vite-release-injection-plugin",
    enforce: "pre" as const, // need this so that vite runs the resolveId hook
    vite: createRollupReleaseInjectionHooks(injectionCode),
  };
}

function viteReactAnnotatePlugin(): UnpluginOptions {
  return {
    name: "sentry-vite-react-annotate-plugin",
    enforce: "pre" as const,
    config() {
      return {
        esbuild: {
          jsx: "automatic",
          // TODO: Allow this to be configured, as users could be using custom react libraries
          jsxImportSource: "react",
        },
        optimizeDeps: { esbuildOptions: { jsx: "automatic" } },
      };
    },
    // @ts-ignore
    vite: createRollupReactAnnotateHooks(),
  };
}

function viteDebugIdInjectionPlugin(): UnpluginOptions {
  return {
    name: "sentry-vite-debug-id-injection-plugin",
    vite: createRollupDebugIdInjectionHooks(),
  };
}

function viteModuleMetadataInjectionPlugin(injectionCode: string): UnpluginOptions {
  return {
    name: "sentry-vite-module-metadata-injection-plugin",
    vite: createRollupModuleMetadataInjectionHooks(injectionCode),
  };
}

function viteDebugIdUploadPlugin(
  upload: (buildArtifacts: string[]) => Promise<void>
): UnpluginOptions {
  return {
    name: "sentry-vite-debug-id-upload-plugin",
    vite: createRollupDebugIdUploadHooks(upload),
  };
}

function viteBundleSizeOptimizationsPlugin(
  replacementValues: SentrySDKBuildFlags
): UnpluginOptions {
  return {
    name: "sentry-vite-bundle-size-optimizations-plugin",
    vite: createRollupBundleSizeOptimizationHooks(replacementValues),
  };
}

const sentryUnplugin = sentryUnpluginFactory({
  releaseInjectionPlugin: viteReleaseInjectionPlugin,
  reactAnnotatePlugin: viteReactAnnotatePlugin,
  debugIdInjectionPlugin: viteDebugIdInjectionPlugin,
  moduleMetadataInjectionPlugin: viteModuleMetadataInjectionPlugin,
  debugIdUploadPlugin: viteDebugIdUploadPlugin,
  bundleSizeOptimizationsPlugin: viteBundleSizeOptimizationsPlugin,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryVitePlugin: (options: Options) => any = sentryUnplugin.vite;

export type { Options as SentryVitePluginOptions } from "@sentry/bundler-plugin-core";
export { sentryCliBinaryExists } from "@sentry/bundler-plugin-core";
