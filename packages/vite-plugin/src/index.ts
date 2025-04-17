import {
  sentryUnpluginFactory,
  Options,
  createRollupReleaseInjectionHooks,
  createRollupModuleMetadataInjectionHooks,
  createRollupDebugIdInjectionHooks,
  createRollupDebugIdUploadHooks,
  SentrySDKBuildFlags,
  createRollupBundleSizeOptimizationHooks,
  createComponentNameAnnotateHooks,
  Logger,
} from "@sentry/bundler-plugin-core";
import { UnpluginOptions, VitePlugin } from "unplugin";

function viteReleaseInjectionPlugin(injectionCode: string): UnpluginOptions {
  return {
    name: "sentry-vite-release-injection-plugin",
    // run `post` to avoid tripping up @rollup/plugin-commonjs when cjs is used
    // as we inject an `import` statement
    enforce: "post" as const, // need this so that vite runs the resolveId hook
    vite: createRollupReleaseInjectionHooks(injectionCode),
  };
}

function viteComponentNameAnnotatePlugin(ignoredComponents?: string[]): UnpluginOptions {
  return {
    name: "sentry-vite-component-name-annotate-plugin",
    enforce: "pre" as const,
    vite: createComponentNameAnnotateHooks(ignoredComponents),
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
  upload: (buildArtifacts: string[]) => Promise<void>,
  logger: Logger,
  createDependencyOnBuildArtifacts: () => () => void
): UnpluginOptions {
  return {
    name: "sentry-vite-debug-id-upload-plugin",
    vite: createRollupDebugIdUploadHooks(upload, logger, createDependencyOnBuildArtifacts),
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
  componentNameAnnotatePlugin: viteComponentNameAnnotatePlugin,
  debugIdInjectionPlugin: viteDebugIdInjectionPlugin,
  moduleMetadataInjectionPlugin: viteModuleMetadataInjectionPlugin,
  debugIdUploadPlugin: viteDebugIdUploadPlugin,
  bundleSizeOptimizationsPlugin: viteBundleSizeOptimizationsPlugin,
});

export const sentryVitePlugin: (options?: Options) => VitePlugin[] = sentryUnplugin.vite;

export type { Options as SentryVitePluginOptions } from "@sentry/bundler-plugin-core";
export { sentryCliBinaryExists } from "@sentry/bundler-plugin-core";
