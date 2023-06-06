import {
  sentryUnpluginFactory,
  Options,
  createRollupReleaseInjectionHooks,
  createRollupDebugIdUploadHooks,
  getDebugIdSnippet,
} from "@sentry/bundler-plugin-core";
import type { UnpluginOptions } from "unplugin";
import { v4 as uuidv4 } from "uuid";

function rollupReleaseInjectionPlugin(injectionCode: string): UnpluginOptions {
  return {
    name: "sentry-rollup-release-injection-plugin",
    rollup: createRollupReleaseInjectionHooks(injectionCode),
  };
}

function rollupDebugIdInjectionPlugin(): UnpluginOptions {
  return {
    name: "sentry-rollup-debug-id-injection-plugin",
    rollup: {
      intro() {
        const debugId = uuidv4();
        const codeToInject = getDebugIdSnippet(debugId);
        return codeToInject;
      },
    },
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
  debugIdUploadPlugin: rollupDebugIdUploadPlugin,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryRollupPlugin: (options: Options) => any = sentryUnplugin.rollup;

export type { Options as SentryRollupPluginOptions } from "@sentry/bundler-plugin-core";
export { sentryCliBinaryExists } from "@sentry/bundler-plugin-core";
