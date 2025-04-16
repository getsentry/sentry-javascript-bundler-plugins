import { transformAsync } from "@babel/core";
import componentNameAnnotatePlugin from "@sentry/babel-plugin-component-annotate";
import SentryCli from "@sentry/cli";
import { logger } from "@sentry/utils";
import * as fs from "fs";
import { glob } from "glob";
import MagicString from "magic-string";
import * as path from "path";
import { createUnplugin, TransformResult, UnpluginOptions } from "unplugin";
import { createSentryBuildPluginManager } from "./build-plugin-manager";
import { createDebugIdUploadFunction } from "./debug-id-upload";
import { Logger } from "./logger";
import { Options, SentrySDKBuildFlags } from "./types";
import {
  generateGlobalInjectorCode,
  generateModuleMetadataInjectorCode,
  getDependencies,
  getPackageJson,
  parseMajorVersion,
  replaceBooleanFlagsInCode,
  stringToUUID,
  stripQueryAndHashFromPath,
} from "./utils";

interface SentryUnpluginFactoryOptions {
  releaseInjectionPlugin: (injectionCode: string) => UnpluginOptions;
  componentNameAnnotatePlugin?: (ignoredComponents?: string[]) => UnpluginOptions;
  moduleMetadataInjectionPlugin: (injectionCode: string) => UnpluginOptions;
  debugIdInjectionPlugin: (logger: Logger) => UnpluginOptions;
  debugIdUploadPlugin: (
    upload: (buildArtifacts: string[]) => Promise<void>,
    logger: Logger,
    createDependencyOnBuildArtifacts: () => () => void,
    webpack_forceExitOnBuildComplete?: boolean
  ) => UnpluginOptions;
  bundleSizeOptimizationsPlugin: (buildFlags: SentrySDKBuildFlags) => UnpluginOptions;
}

/**
 * Creates an unplugin instance used to create Sentry plugins for Vite, Rollup, esbuild, and Webpack.
 */
export function sentryUnpluginFactory({
  releaseInjectionPlugin,
  componentNameAnnotatePlugin,
  moduleMetadataInjectionPlugin,
  debugIdInjectionPlugin,
  debugIdUploadPlugin,
  bundleSizeOptimizationsPlugin,
}: SentryUnpluginFactoryOptions) {
  return createUnplugin<Options | undefined, true>((userOptions = {}, unpluginMetaContext) => {
    const sentryBuildPluginManager = createSentryBuildPluginManager(userOptions, {
      loggerPrefix:
        userOptions._metaOptions?.loggerPrefixOverride ??
        `[sentry-${unpluginMetaContext.framework}-plugin]`,
      buildTool: unpluginMetaContext.framework,
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
      async buildStart() {
        await sentryBuildPluginManager.telemetry.emitBundlerPluginExecutionSignal();
      },
    });

    if (Object.keys(bundleSizeOptimizationReplacementValues).length > 0) {
      plugins.push(bundleSizeOptimizationsPlugin(bundleSizeOptimizationReplacementValues));
    }

    if (!options.release.inject) {
      logger.debug(
        "Release injection disabled via `release.inject` option. Will not inject release."
      );
    } else if (!options.release.name) {
      logger.debug(
        "No release name provided. Will not inject release. Please set the `release.name` option to identify your release."
      );
    } else {
      const injectionCode = generateGlobalInjectorCode({
        release: options.release.name,
        injectBuildInformation: options._experiments.injectBuildInformation || false,
      });
      plugins.push(releaseInjectionPlugin(injectionCode));
    }

    if (Object.keys(sentryBuildPluginManager.bundleMetadata).length > 0) {
      const injectionCode = generateModuleMetadataInjectorCode(
        sentryBuildPluginManager.bundleMetadata
      );
      plugins.push(moduleMetadataInjectionPlugin(injectionCode));
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

    if (!options.sourcemaps?.disable) {
      plugins.push(debugIdInjectionPlugin(logger));
    }

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
            componentNameAnnotatePlugin(options.reactComponentAnnotation.ignoredComponents)
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
 * @deprecated
 */
// TODO(v4): Don't export this from the package
export function getBuildInformation() {
  const packageJson = getPackageJson();

  const { deps, depsVersions } = packageJson
    ? getDependencies(packageJson)
    : { deps: [], depsVersions: {} };

  return {
    deps,
    depsVersions,
    nodeVersion: parseMajorVersion(process.version),
  };
}

/**
 * Determines whether the Sentry CLI binary is in its expected location.
 * This function is useful since `@sentry/cli` installs the binary via a post-install
 * script and post-install scripts may not always run. E.g. with `npm i --ignore-scripts`.
 */
export function sentryCliBinaryExists(): boolean {
  return fs.existsSync(SentryCli.getPath());
}

export function createRollupReleaseInjectionHooks(injectionCode: string) {
  const virtualReleaseInjectionFileId = "\0sentry-release-injection-file";
  return {
    resolveId(id: string) {
      if (id === virtualReleaseInjectionFileId) {
        return {
          id: virtualReleaseInjectionFileId,
          external: false,
          moduleSideEffects: true,
        };
      } else {
        return null;
      }
    },

    load(id: string) {
      if (id === virtualReleaseInjectionFileId) {
        return injectionCode;
      } else {
        return null;
      }
    },

    transform(code: string, id: string) {
      if (id === virtualReleaseInjectionFileId) {
        return null;
      }

      // id may contain query and hash which will trip up our file extension logic below
      const idWithoutQueryAndHash = stripQueryAndHashFromPath(id);

      if (idWithoutQueryAndHash.match(/\\node_modules\\|\/node_modules\//)) {
        return null;
      }

      if (
        ![".js", ".ts", ".jsx", ".tsx", ".mjs"].some((ending) =>
          idWithoutQueryAndHash.endsWith(ending)
        )
      ) {
        return null;
      }

      const ms = new MagicString(code);

      // Appending instead of prepending has less probability of mucking with user's source maps.
      // Luckily import statements get hoisted to the top anyways.
      ms.append(`\n\n;import "${virtualReleaseInjectionFileId}";`);

      return {
        code: ms.toString(),
        map: ms.generateMap({ hires: "boundary" }),
      };
    },
  };
}

export function createRollupBundleSizeOptimizationHooks(replacementValues: SentrySDKBuildFlags) {
  return {
    transform(code: string) {
      return replaceBooleanFlagsInCode(code, replacementValues);
    },
  };
}

// We need to be careful not to inject the snippet before any `"use strict";`s.
// As an additional complication `"use strict";`s may come after any number of comments.
const COMMENT_USE_STRICT_REGEX =
  // Note: CodeQL complains that this regex potentially has n^2 runtime. This likely won't affect realistic files.
  /^(?:\s*|\/\*(?:.|\r|\n)*?\*\/|\/\/.*[\n\r])*(?:"[^"]*";|'[^']*';)?/;

export function createRollupDebugIdInjectionHooks() {
  return {
    renderChunk(code: string, chunk: { fileName: string }) {
      if (
        // chunks could be any file (html, md, ...)
        [".js", ".mjs", ".cjs"].some((ending) =>
          stripQueryAndHashFromPath(chunk.fileName).endsWith(ending)
        )
      ) {
        const debugId = stringToUUID(code); // generate a deterministic debug ID
        const codeToInject = getDebugIdSnippet(debugId);

        const ms = new MagicString(code, { filename: chunk.fileName });

        const match = code.match(COMMENT_USE_STRICT_REGEX)?.[0];

        if (match) {
          // Add injected code after any comments or "use strict" at the beginning of the bundle.
          ms.appendLeft(match.length, codeToInject);
        } else {
          // ms.replace() doesn't work when there is an empty string match (which happens if
          // there is neither, a comment, nor a "use strict" at the top of the chunk) so we
          // need this special case here.
          ms.prepend(codeToInject);
        }

        return {
          code: ms.toString(),
          map: ms.generateMap({ file: chunk.fileName, hires: "boundary" }),
        };
      } else {
        return null; // returning null means not modifying the chunk at all
      }
    },
  };
}

export function createRollupModuleMetadataInjectionHooks(injectionCode: string) {
  return {
    renderChunk(code: string, chunk: { fileName: string }) {
      if (
        // chunks could be any file (html, md, ...)
        [".js", ".mjs", ".cjs"].some((ending) =>
          stripQueryAndHashFromPath(chunk.fileName).endsWith(ending)
        )
      ) {
        const ms = new MagicString(code, { filename: chunk.fileName });

        const match = code.match(COMMENT_USE_STRICT_REGEX)?.[0];

        if (match) {
          // Add injected code after any comments or "use strict" at the beginning of the bundle.
          ms.appendLeft(match.length, injectionCode);
        } else {
          // ms.replace() doesn't work when there is an empty string match (which happens if
          // there is neither, a comment, nor a "use strict" at the top of the chunk) so we
          // need this special case here.
          ms.prepend(injectionCode);
        }

        return {
          code: ms.toString(),
          map: ms.generateMap({ file: chunk.fileName, hires: "boundary" }),
        };
      } else {
        return null; // returning null means not modifying the chunk at all
      }
    },
  };
}

export function createRollupDebugIdUploadHooks(
  upload: (buildArtifacts: string[]) => Promise<void>,
  _logger: Logger,
  createDependencyOnBuildArtifacts: () => () => void
) {
  const freeGlobalDependencyOnDebugIdSourcemapArtifacts = createDependencyOnBuildArtifacts();
  return {
    async writeBundle(
      outputOptions: { dir?: string; file?: string },
      bundle: { [fileName: string]: unknown }
    ) {
      try {
        if (outputOptions.dir) {
          const outputDir = outputOptions.dir;
          const buildArtifacts = await glob(
            [
              "/**/*.js",
              "/**/*.mjs",
              "/**/*.cjs",
              "/**/*.js.map",
              "/**/*.mjs.map",
              "/**/*.cjs.map",
            ].map((q) => `${q}?(\\?*)?(#*)`), // We want to allow query and hashes strings at the end of files
            {
              root: outputDir,
              absolute: true,
              nodir: true,
            }
          );
          await upload(buildArtifacts);
        } else if (outputOptions.file) {
          await upload([outputOptions.file]);
        } else {
          const buildArtifacts = Object.keys(bundle).map((asset) =>
            path.join(path.resolve(), asset)
          );
          await upload(buildArtifacts);
        }
      } finally {
        freeGlobalDependencyOnDebugIdSourcemapArtifacts();
      }
    },
  };
}

export function createComponentNameAnnotateHooks(ignoredComponents?: string[]) {
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

      try {
        const result = await transformAsync(code, {
          plugins: [[componentNameAnnotatePlugin, { ignoredComponents }]],
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

export function getDebugIdSnippet(debugId: string): string {
  return `;{try{let e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="${debugId}",e._sentryDebugIdIdentifier="sentry-dbid-${debugId}")}catch(e){}};`;
}

export type { Logger } from "./logger";
export type { Options, SentrySDKBuildFlags } from "./types";
export { replaceBooleanFlagsInCode, stringToUUID } from "./utils";
export { createSentryBuildPluginManager } from "./build-plugin-manager";
