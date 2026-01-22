import {
  sentryUnpluginFactory,
  Options,
  createRollupInjectionHooks,
  createRollupDebugIdUploadHooks,
  SentrySDKBuildFlags,
  createRollupBundleSizeOptimizationHooks,
  createComponentNameAnnotateHooks,
  Logger,
} from "@sentry/bundler-plugin-core";
import type { UnpluginOptions } from "unplugin";

function rollupComponentNameAnnotatePlugin(
  ignoredComponents: string[],
  injectIntoHtml: boolean
): UnpluginOptions {
  return {
    name: "sentry-rollup-component-name-annotate-plugin",
    rollup: createComponentNameAnnotateHooks(ignoredComponents, injectIntoHtml),
  };
}

function rollupInjectionPlugin(injectionCode: string, debugIds: boolean): UnpluginOptions {
  return {
    name: "sentry-rollup-injection-plugin",
    rollup: createRollupInjectionHooks(injectionCode, debugIds),
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
  injectionPlugin: rollupInjectionPlugin,
  componentNameAnnotatePlugin: rollupComponentNameAnnotatePlugin,
  debugIdUploadPlugin: rollupDebugIdUploadPlugin,
  bundleSizeOptimizationsPlugin: rollupBundleSizeOptimizationsPlugin,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryRollupPlugin: (options?: Options) => any = sentryUnplugin.rollup;

export type { Options as SentryRollupPluginOptions } from "@sentry/bundler-plugin-core";
export { sentryCliBinaryExists } from "@sentry/bundler-plugin-core";
