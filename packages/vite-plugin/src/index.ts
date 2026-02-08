import {
  CodeInjection,
  sentryUnpluginFactory,
  Options,
  createRollupInjectionHooks,
  createRollupDebugIdUploadHooks,
  SentrySDKBuildFlags,
  createRollupBundleSizeOptimizationHooks,
  createComponentNameAnnotateHooks,
  Logger,
} from "@sentry/bundler-plugin-core";
import { createRequire } from "node:module";
import { UnpluginOptions, VitePlugin } from "unplugin";

function viteInjectionPlugin(injectionCode: CodeInjection, debugIds: boolean): UnpluginOptions {
  return {
    name: "sentry-vite-injection-plugin",
    // run `post` to avoid tripping up @rollup/plugin-commonjs when cjs is used
    // as we inject an `import` statement
    enforce: "post" as const, // need this so that vite runs the resolveId hook
    vite: createRollupInjectionHooks(injectionCode, debugIds),
  };
}

function viteComponentNameAnnotatePlugin(
  ignoredComponents: string[],
  injectIntoHtml: boolean
): UnpluginOptions {
  return {
    name: "sentry-vite-component-name-annotate-plugin",
    enforce: "pre" as const,
    vite: createComponentNameAnnotateHooks(ignoredComponents, injectIntoHtml),
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

function getViteMajorVersion(): string | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Rollup already transpiles this for us
    const req = createRequire(import.meta.url);
    const vite = req("vite") as { version?: string };
    return vite.version?.split(".")[0];
  } catch (err) {
    // do nothing, we'll just not report a version
  }

  return undefined;
}

const sentryUnplugin = sentryUnpluginFactory({
  injectionPlugin: viteInjectionPlugin,
  componentNameAnnotatePlugin: viteComponentNameAnnotatePlugin,
  debugIdUploadPlugin: viteDebugIdUploadPlugin,
  bundleSizeOptimizationsPlugin: viteBundleSizeOptimizationsPlugin,
  getBundlerMajorVersion: getViteMajorVersion,
});

export const sentryVitePlugin = (options?: Options): VitePlugin[] => {
  const result = sentryUnplugin.vite(options);
  // unplugin returns a single plugin instead of an array when only one plugin is created, so we normalize this here.
  return Array.isArray(result) ? result : [result];
};

export type { Options as SentryVitePluginOptions } from "@sentry/bundler-plugin-core";
export { sentryCliBinaryExists } from "@sentry/bundler-plugin-core";
