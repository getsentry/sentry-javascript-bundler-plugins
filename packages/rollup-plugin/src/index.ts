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
import type { UnpluginOptions } from "unplugin";

function rollupReleaseInjectionPlugin(injectionCode: string): UnpluginOptions {
  return {
    name: "sentry-rollup-release-injection-plugin",
    rollup: createRollupReleaseInjectionHooks(injectionCode),
  };
}

function rollupComponentNameAnnotatePlugin(ignoredComponents?: string[]): UnpluginOptions {
  return {
    name: "sentry-rollup-component-name-annotate-plugin",
    rollup: createComponentNameAnnotateHooks(ignoredComponents),
  };
}

function rollupDebugIdInjectionPlugin(): UnpluginOptions {
  return {
    name: "sentry-rollup-debug-id-injection-plugin",
    rollup: createRollupDebugIdInjectionHooks(),
  };
}

function rollupModuleMetadataInjectionPlugin(injectionCode: string): UnpluginOptions {
  return {
    name: "sentry-rollup-module-metadata-injection-plugin",
    rollup: createRollupModuleMetadataInjectionHooks(injectionCode),
  };
}

function rollupDebugIdUploadPlugin(
  upload: (buildArtifacts: string[]) => Promise<void>,
  logger: Logger,
  createDependencyOnBuildArtifacts: () => () => void
): UnpluginOptions {
  return {
    name: "sentry-rollup-debug-id-upload-plugin",
    rollup: createRollupDebugIdUploadHooks(upload, logger, createDependencyOnBuildArtifacts),
  };
}

function rollupBundleSizeOptimizationsPlugin(
  replacementValues: SentrySDKBuildFlags
): UnpluginOptions {
  return {
    name: "sentry-rollup-bundle-size-optimizations-plugin",
    rollup: createRollupBundleSizeOptimizationHooks(replacementValues),
  };
}

const sentryUnplugin = sentryUnpluginFactory({
  releaseInjectionPlugin: rollupReleaseInjectionPlugin,
  componentNameAnnotatePlugin: rollupComponentNameAnnotatePlugin,
  debugIdInjectionPlugin: rollupDebugIdInjectionPlugin,
  moduleMetadataInjectionPlugin: rollupModuleMetadataInjectionPlugin,
  debugIdUploadPlugin: rollupDebugIdUploadPlugin,
  bundleSizeOptimizationsPlugin: rollupBundleSizeOptimizationsPlugin,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryRollupPlugin: (options?: Options) => any = sentryUnplugin.rollup;

export type { Options as SentryRollupPluginOptions } from "@sentry/bundler-plugin-core";
export { sentryCliBinaryExists } from "@sentry/bundler-plugin-core";
