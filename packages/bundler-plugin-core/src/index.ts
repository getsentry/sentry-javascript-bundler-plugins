import { transformAsync } from "@babel/core";
import componentNameAnnotatePlugin, {
  experimentalComponentNameAnnotatePlugin,
} from "@sentry/babel-plugin-component-annotate";
import SentryCli from "@sentry/cli";
import { logger } from "@sentry/utils";
import * as fs from "fs";
import { glob } from "glob";
import { createUnplugin, TransformResult, UnpluginInstance, UnpluginOptions } from "unplugin";
import { createSentryBuildPluginManager } from "./build-plugin-manager";
import { createDebugIdUploadFunction } from "./debug-id-upload";
import { Logger } from "./logger";
import { Options, SentrySDKBuildFlags } from "./types";
import {
  CodeInjection,
  containsOnlyImports,
  generateReleaseInjectorCode,
  generateModuleMetadataInjectorCode,
  stripQueryAndHashFromPath,
} from "./utils";

type InjectionPlugin = (
  injectionCode: CodeInjection,
  debugIds: boolean,
  logger: Logger
) => UnpluginOptions;
type LegacyPlugins = {
  releaseInjectionPlugin: (injectionCode: string) => UnpluginOptions;
  moduleMetadataInjectionPlugin: (injectionCode: string) => UnpluginOptions;
  debugIdInjectionPlugin: (logger: Logger) => UnpluginOptions;
};

interface SentryUnpluginFactoryOptions {
  injectionPlugin: InjectionPlugin | LegacyPlugins;
  componentNameAnnotatePlugin?: (
    ignoredComponents: string[],
    injectIntoHtml: boolean
  ) => UnpluginOptions;
  debugIdUploadPlugin: (
    upload: (buildArtifacts: string[]) => Promise<void>,
    logger: Logger,
    createDependencyOnBuildArtifacts: () => () => void,
    webpack_forceExitOnBuildComplete?: boolean
  ) => UnpluginOptions;
  bundleSizeOptimizationsPlugin: (buildFlags: SentrySDKBuildFlags) => UnpluginOptions;
  getBundlerMajorVersion?: () => string | undefined;
}

/**
 * Creates an unplugin instance used to create Sentry plugins for Vite, Rollup, esbuild, and Webpack.
 */
export function sentryUnpluginFactory({
  injectionPlugin,
  componentNameAnnotatePlugin,
  debugIdUploadPlugin,
  bundleSizeOptimizationsPlugin,
  getBundlerMajorVersion,
}: SentryUnpluginFactoryOptions): UnpluginInstance<Options | undefined, true> {
  return createUnplugin<Options | undefined, true>((userOptions = {}, unpluginMetaContext) => {
    const sentryBuildPluginManager = createSentryBuildPluginManager(userOptions, {
      loggerPrefix:
        userOptions._metaOptions?.loggerPrefixOverride ??
        `[sentry-${unpluginMetaContext.framework}-plugin]`,
      buildTool: unpluginMetaContext.framework,
      buildToolMajorVersion: getBundlerMajorVersion?.(),
    });

    const {
      logger,
      normalizedOptions: options,
      bundleSizeOptimizationReplacementValues,
    } = sentryBuildPluginManager;

    if (options.disable) {
      return [
        {
          name: "sentry-noop-plugin",
        },
      ];
    }

    if (process.cwd().match(/\\node_modules\\|\/node_modules\//)) {
      logger.warn(
        "Running Sentry plugin from within a `node_modules` folder. Some features may not work."
      );
    }

    const plugins: UnpluginOptions[] = [];

    // Add plugin to emit a telemetry signal when the build starts
    plugins.push({
      name: "sentry-telemetry-plugin",
      buildStart() {
        // Technically, for very fast builds we might miss the telemetry signal
        // but it's okay because telemetry is not critical for us.
        // We cannot await the flush here because it would block the build start
        // which in turn would break module federation builds, see
        // https://github.com/getsentry/sentry-javascript-bundler-plugins/issues/816
        void sentryBuildPluginManager.telemetry.emitBundlerPluginExecutionSignal().catch(() => {
          // Nothing for the users to do here. If telemetry fails it's acceptable.
        });
      },
    });

    if (Object.keys(bundleSizeOptimizationReplacementValues).length > 0) {
      plugins.push(bundleSizeOptimizationsPlugin(bundleSizeOptimizationReplacementValues));
    }

    const injectionCode = new CodeInjection();

    if (!options.release.inject) {
      logger.debug(
        "Release injection disabled via `release.inject` option. Will not inject release."
      );
    } else if (!options.release.name) {
      logger.debug(
        "No release name provided. Will not inject release. Please set the `release.name` option to identify your release."
      );
    } else {
      const code = generateReleaseInjectorCode({
        release: options.release.name,
        injectBuildInformation: options._experiments.injectBuildInformation || false,
      });
      if (typeof injectionPlugin !== "function") {
        plugins.push(injectionPlugin.releaseInjectionPlugin(code.code()));
      } else {
        injectionCode.append(code);
      }
    }

    if (Object.keys(sentryBuildPluginManager.bundleMetadata).length > 0) {
      const code = generateModuleMetadataInjectorCode(sentryBuildPluginManager.bundleMetadata);
      if (typeof injectionPlugin !== "function") {
        plugins.push(injectionPlugin.moduleMetadataInjectionPlugin(code.code()));
      } else {
        injectionCode.append(code);
      }
    }

    if (
      typeof injectionPlugin === "function" &&
      (!injectionCode.isEmpty() || options.sourcemaps?.disable !== true)
    ) {
      plugins.push(injectionPlugin(injectionCode, options.sourcemaps?.disable !== true, logger));
    }

    // Add plugin to create and finalize releases, and also take care of adding commits and legacy sourcemaps
    const freeGlobalDependencyOnBuildArtifacts =
      sentryBuildPluginManager.createDependencyOnBuildArtifacts();
    plugins.push({
      name: "sentry-release-management-plugin",
      async writeBundle() {
        try {
          await sentryBuildPluginManager.createRelease();
        } finally {
          freeGlobalDependencyOnBuildArtifacts();
        }
      },
    });

    if (options.sourcemaps?.disable !== true) {
      if (typeof injectionPlugin !== "function") {
        plugins.push(injectionPlugin.debugIdInjectionPlugin(logger));
      }

      if (options.sourcemaps?.disable !== "disable-upload") {
        // This option is only strongly typed for the webpack plugin, where it is used. It has no effect on other plugins
        const webpack_forceExitOnBuildComplete =
          typeof options._experiments["forceExitOnBuildCompletion"] === "boolean"
            ? options._experiments["forceExitOnBuildCompletion"]
            : undefined;

        plugins.push(
          debugIdUploadPlugin(
            createDebugIdUploadFunction({
              sentryBuildPluginManager,
            }),
            logger,
            sentryBuildPluginManager.createDependencyOnBuildArtifacts,
            webpack_forceExitOnBuildComplete
          )
        );
      }
    }

    if (options.reactComponentAnnotation) {
      if (!options.reactComponentAnnotation.enabled) {
        logger.debug(
          "The component name annotate plugin is currently disabled. Skipping component name annotations."
        );
      } else if (options.reactComponentAnnotation.enabled && !componentNameAnnotatePlugin) {
        logger.warn(
          "The component name annotate plugin is currently not supported by '@sentry/esbuild-plugin'"
        );
      } else {
        componentNameAnnotatePlugin &&
          plugins.push(
            componentNameAnnotatePlugin(
              options.reactComponentAnnotation.ignoredComponents || [],
              !!options.reactComponentAnnotation._experimentalInjectIntoHtml
            )
          );
      }
    }

    // Add plugin to delete unwanted artifacts like source maps after the uploads have completed
    plugins.push({
      name: "sentry-file-deletion-plugin",
      async writeBundle() {
        await sentryBuildPluginManager.deleteArtifacts();
      },
    });

    return plugins;
  });
}

/**
 * Determines whether the Sentry CLI binary is in its expected location.
 * This function is useful since `@sentry/cli` installs the binary via a post-install
 * script and post-install scripts may not always run. E.g. with `npm i --ignore-scripts`.
 */
export function sentryCliBinaryExists(): boolean {
  return fs.existsSync(SentryCli.getPath());
}

// We need to be careful not to inject the snippet before any `"use strict";`s.
// As an additional complication `"use strict";`s may come after any number of comments.
export const COMMENT_USE_STRICT_REGEX =
  // Note: CodeQL complains that this regex potentially has n^2 runtime. This likely won't affect realistic files.
  /^(?:\s*|\/\*(?:.|\r|\n)*?\*\/|\/\/.*[\n\r])*(?:"[^"]*";|'[^']*';)?/;

/**
 * Checks if a file is a JavaScript file based on its extension.
 * Handles query strings and hashes in the filename.
 */
export function isJsFile(fileName: string): boolean {
  const cleanFileName = stripQueryAndHashFromPath(fileName);
  return [".js", ".mjs", ".cjs"].some((ext) => cleanFileName.endsWith(ext));
}

/**
 * Checks if a chunk should be skipped for code injection
 *
 * This is necessary to handle Vite's MPA (multi-page application) mode where
 * HTML entry points create "facade" chunks that should not contain injected code.
 * See: https://github.com/getsentry/sentry-javascript-bundler-plugins/issues/829
 *
 * However, in SPA mode, the main bundle also has an HTML facade but contains
 * substantial application code. We should NOT skip injection for these bundles.
 *
 * @param code - The chunk's code content
 * @param facadeModuleId - The facade module ID (if any) - HTML files create facade chunks
 * @returns true if the chunk should be skipped
 */
export function shouldSkipCodeInjection(
  code: string,
  facadeModuleId: string | null | undefined
): boolean {
  // Skip empty chunks - these are placeholder chunks that should be optimized away
  if (code.trim().length === 0) {
    return true;
  }

  // For HTML facade chunks, only skip if they contain only import statements
  if (facadeModuleId && stripQueryAndHashFromPath(facadeModuleId).endsWith(".html")) {
    return containsOnlyImports(code);
  }

  return false;
}

export function globFiles(outputDir: string): Promise<string[]> {
  return glob(
    ["/**/*.js", "/**/*.mjs", "/**/*.cjs", "/**/*.js.map", "/**/*.mjs.map", "/**/*.cjs.map"].map(
      (q) => `${q}?(\\?*)?(#*)`
    ), // We want to allow query and hashes strings at the end of files
    {
      root: outputDir,
      absolute: true,
      nodir: true,
    }
  );
}

export function createComponentNameAnnotateHooks(
  ignoredComponents: string[],
  injectIntoHtml: boolean
): {
  transform: UnpluginOptions["transform"];
} {
  type ParserPlugins = NonNullable<
    NonNullable<Parameters<typeof transformAsync>[1]>["parserOpts"]
  >["plugins"];

  return {
    async transform(this: void, code: string, id: string): Promise<TransformResult> {
      // id may contain query and hash which will trip up our file extension logic below
      const idWithoutQueryAndHash = stripQueryAndHashFromPath(id);

      if (idWithoutQueryAndHash.match(/\\node_modules\\|\/node_modules\//)) {
        return null;
      }

      // We will only apply this plugin on jsx and tsx files
      if (![".jsx", ".tsx"].some((ending) => idWithoutQueryAndHash.endsWith(ending))) {
        return null;
      }

      const parserPlugins: ParserPlugins = [];
      if (idWithoutQueryAndHash.endsWith(".jsx")) {
        parserPlugins.push("jsx");
      } else if (idWithoutQueryAndHash.endsWith(".tsx")) {
        parserPlugins.push("jsx", "typescript");
      }

      const plugin = injectIntoHtml
        ? experimentalComponentNameAnnotatePlugin
        : componentNameAnnotatePlugin;

      try {
        const result = await transformAsync(code, {
          plugins: [[plugin, { ignoredComponents }]],
          filename: id,
          parserOpts: {
            sourceType: "module",
            allowAwaitOutsideFunction: true,
            plugins: parserPlugins,
          },
          generatorOpts: {
            decoratorsBeforeExport: true,
          },
          sourceMaps: true,
        });

        return {
          code: result?.code ?? code,
          map: result?.map,
        };
      } catch (e) {
        logger.error(`Failed to apply react annotate plugin`, e);
      }

      return { code };
    },
  };
}

export function getDebugIdSnippet(debugId: string): CodeInjection {
  return new CodeInjection(
    `var n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="${debugId}",e._sentryDebugIdIdentifier="sentry-dbid-${debugId}");`
  );
}

export type { Logger } from "./logger";
export type { Options, SentrySDKBuildFlags } from "./types";
export {
  CodeInjection,
  replaceBooleanFlagsInCode,
  stringToUUID,
  generateReleaseInjectorCode,
  generateModuleMetadataInjectorCode,
} from "./utils";
export { createSentryBuildPluginManager } from "./build-plugin-manager";
export { createDebugIdUploadFunction } from "./debug-id-upload";
