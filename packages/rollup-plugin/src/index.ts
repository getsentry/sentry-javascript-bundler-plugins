import {
  sentryUnpluginFactory,
  Options,
  createRollupReleaseInjectionHooks,
  createRollupModuleMetadataInjectionHooks,
  createRollupDebugIdInjectionHooks,
  createRollupDebugIdUploadHooks,
} from "@sentry/bundler-plugin-core";
import type { UnpluginOptions } from "unplugin";

function rollupReleaseInjectionPlugin(injectionCode: string): UnpluginOptions {
  return {
    name: "sentry-rollup-release-injection-plugin",
    rollup: createRollupReleaseInjectionHooks(injectionCode),
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
  upload: (buildArtifacts: string[]) => Promise<void>
): UnpluginOptions {
  return {
    name: "sentry-rollup-debug-id-upload-plugin",
    rollup: createRollupDebugIdUploadHooks(upload),
  };
}

const sentryUnplugin = sentryUnpluginFactory({
  releaseInjectionPlugin: rollupReleaseInjectionPlugin,
  debugIdInjectionPlugin: rollupDebugIdInjectionPlugin,
  moduleMetadataInjectionPlugin: rollupModuleMetadataInjectionPlugin,
  debugIdUploadPlugin: rollupDebugIdUploadPlugin,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryRollupPlugin: (options: Options) => any = sentryUnplugin.rollup;

export type { Options as SentryRollupPluginOptions } from "@sentry/bundler-plugin-core";
export { sentryCliBinaryExists } from "@sentry/bundler-plugin-core";
