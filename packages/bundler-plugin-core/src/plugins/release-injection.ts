import MagicString from "magic-string";
import type { UnpluginOptions } from "unplugin";
import { getDependencies, getPackageJson, parseMajorVersion } from "../utils";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore No typedefs for webpack 4
import { BannerPlugin as Webpack4BannerPlugin } from "webpack-4";

import type { Plugin } from "rollup";

interface ReleaseInjectionPluginOptions {
  release: string;
  org?: string;
  project?: string;
  injectReleasesMap: boolean;
  injectBuildInformation: boolean;
}

/**
 * Rollup specific plugin to inject release values.
 *
 * This plugin works by creating a virtual module containing the injection which we then from every user module.
 */
export function rollupReleaseInjectionPlugin(
  options: ReleaseInjectionPluginOptions
): UnpluginOptions {
  return {
    name: "sentry-rollup-release-injection-plugin",
    rollup: createRollupReleaseInjectionHooks(options),
  };
}

/**
 * Rollup specific plugin to inject release values.
 *
 * This plugin works by creating a virtual module containing the injection which we then from every user module.
 */
export function viteReleaseInjectionPlugin(
  options: ReleaseInjectionPluginOptions
): UnpluginOptions {
  return {
    name: "sentry-vite-release-injection-plugin",
    enforce: "pre", // need this so that vite runs the resolveId hook
    vite: createRollupReleaseInjectionHooks(options),
  };
}

/**
 * Webpack specific plugin to inject release values.
 *
 * This plugin works by using the Webpack banner plugin to prepend output bundles with release injection code.
 */
export function webpackReleaseInjectionPlugin(
  options: ReleaseInjectionPluginOptions
): UnpluginOptions {
  const pluginName = "sentry-webpack-release-injection-plugin";

  return {
    name: pluginName,

    webpack(compiler) {
      const codeToInject = generateGlobalInjectorCode({
        release: options.release,
        injectReleasesMap: options.injectReleasesMap,
        injectBuildInformation: options.injectBuildInformation,
        org: options.org,
        project: options.project,
      });

      if (compiler?.webpack?.BannerPlugin) {
        compiler.options.plugins.push(
          new compiler.webpack.BannerPlugin({
            raw: true,
            include: /\.(js|ts|jsx|tsx|mjs|cjs)$/,
            banner: codeToInject,
          })
        );
      } else {
        compiler.options.plugins.push(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
          new Webpack4BannerPlugin({
            raw: true,
            include: /\.(js|ts|jsx|tsx|mjs|cjs)$/,
            banner: codeToInject,
          })
        );
      }
    },
  };
}

/**
 * Esbuild specific plugin to inject release values.
 *
 * This plugin works by pointing esbuild's inject option to a virtual file that
 * we load and fill with release injection code.
 */
export function esbuildReleaseInjectionPlugin(
  options: ReleaseInjectionPluginOptions
): UnpluginOptions {
  const pluginName = "sentry-esbuild-release-injection-plugin";
  const virtualReleaseInjectionFilePath = "_sentry-release-injection-file";

  return {
    name: pluginName,

    esbuild: {
      setup({ initialOptions, onLoad }) {
        initialOptions.inject = initialOptions.inject || [];
        initialOptions.inject.push(virtualReleaseInjectionFilePath);

        onLoad(
          {
            filter: /_sentry-release-injection-file$/,
          },
          () => {
            return {
              loader: "js",
              pluginName,
              contents: generateGlobalInjectorCode({
                release: options.release,
                injectReleasesMap: options.injectReleasesMap,
                injectBuildInformation: options.injectBuildInformation,
                org: options.org,
                project: options.project,
              }),
            };
          }
        );
      },
    },
  };
}

function createRollupReleaseInjectionHooks(
  options: ReleaseInjectionPluginOptions
): Pick<Plugin, "resolveId" | "load" | "transform"> {
  const virtualReleaseInjectionFileId = "\0sentry-release-injection-file";

  return {
    resolveId(id) {
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

    load(id) {
      if (id === virtualReleaseInjectionFileId) {
        return generateGlobalInjectorCode({
          release: options.release,
          injectReleasesMap: options.injectReleasesMap,
          injectBuildInformation: options.injectBuildInformation || false,
          org: options.org,
          project: options.project,
        });
      } else {
        return null;
      }
    },

    transform(code, id) {
      if (id === virtualReleaseInjectionFileId) {
        return null;
      }

      if (id.match(/\\node_modules\\|\/node_modules\//)) {
        return null;
      }

      if (![".js", ".ts", ".jsx", ".tsx", ".mjs"].some((ending) => id.endsWith(ending))) {
        return null;
      }

      const ms = new MagicString(code);

      // Appending instead of prepending has less probability of mucking with user's source maps.
      // Luckily import statements get hoisted to the top anyways.
      ms.append(`\n\n;import "${virtualReleaseInjectionFileId}";`);

      return {
        code: ms.toString(),
        map: ms.generateMap(),
      };
    },
  };
}

/**
 * Generates code for the global injector which is responsible for setting the global
 * `SENTRY_RELEASE` & `SENTRY_BUILD_INFO` variables.
 */
function generateGlobalInjectorCode({
  release,
  injectReleasesMap,
  injectBuildInformation,
  org,
  project,
}: {
  release: string;
  injectReleasesMap: boolean;
  injectBuildInformation: boolean;
  org?: string;
  project?: string;
}) {
  // The code below is mostly ternary operators because it saves bundle size.
  // The checks are to support as many environments as possible. (Node.js, Browser, webworkers, etc.)
  let code = `
    var _global =
      typeof window !== 'undefined' ?
        window :
        typeof global !== 'undefined' ?
          global :
          typeof self !== 'undefined' ?
            self :
            {};

    _global.SENTRY_RELEASE={id:"${release}"};`;

  if (injectReleasesMap && project) {
    const key = org ? `${project}@${org}` : project;
    code += `
      _global.SENTRY_RELEASES=_global.SENTRY_RELEASES || {};
      _global.SENTRY_RELEASES["${key}"]={id:"${release}"};`;
  }

  if (injectBuildInformation) {
    const buildInfo = getBuildInformation();

    code += `
      _global.SENTRY_BUILD_INFO=${JSON.stringify(buildInfo)};`;
  }

  return code;
}

function getBuildInformation() {
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
