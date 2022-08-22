import { createUnplugin } from "unplugin";
import MagicString from "magic-string";
import { getReleaseName } from "./getReleaseName";
import * as path from "path";
import { Options } from "./types";
import { makeSentryFacade } from "./facade";

function generateGlobalInjectorCode({ release }: { release: string }) {
  return `
    var _global =
      typeof window !== 'undefined' ?
        window :
        typeof global !== 'undefined' ?
          global :
          typeof self !== 'undefined' ?
            self :
            {};

    _global.SENTRY_RELEASE={id:"${release}"};`;
}

const unplugin = createUnplugin<Options>((options) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function debugLog(...args: any) {
    if (options?.debugLogging) {
      // eslint-disable-next-line no-console
      console.log("[Sentry-plugin]}", args);
    }
  }

  const entrypoints = new Set<string>();

  return {
    name: "sentry-plugin",
    enforce: "pre", // needed for Vite to call resolveId hook

    /**
     * In the sentry-unplugin, this hook is responsible for creating a Set containing the entrypoints as absolute paths.
     *
     * @param id For imports: The absolute path of the module to be imported. For entrypoints: The path the user defined as entrypoint - may also be relative.
     * @param importer For imports: The absolute path of the module that imported this module. For entrypoints: `undefined`.
     * @param options Additional information to use for making a resolving decision.
     * @returns undefined.
     */
    resolveId(id, importer, { isEntry }) {
      debugLog(
        `Called "resolveId": ${JSON.stringify({ id, importer: importer, options: { isEntry } })}`
      );

      // We only store the absolute path when we encounter an entrypoint
      if (isEntry) {
        // If we're looking at an entrypoint, which is the case here, `id` is either an absolute path or a relative path.
        // If it's an absolute path we can just store it. If it's a relative path, we can assume the path got defined
        // from a config file and when bundlers are run via a config file the process CWD is usually the one the config
        // file is located in, so we can simply join CWD and id and we get the absolute path.
        const entrypoint = path.normalize(path.isAbsolute(id) ? id : path.join(process.cwd(), id));
        entrypoints.add(entrypoint);
        debugLog(`Added entrypoint: ${entrypoint}`);
      }

      return undefined;
    },

    /**
     * Determines whether we want to transform a module.
     *
     * @param id Always the absolute (fully resolved) path to the module.
     * @returns `true` or `false` depending on whether we want to transform the module. For the sentry-unplugin we only
     * want to transform entrypoints.
     */
    transformInclude(id) {
      const shouldTransform = entrypoints.has(path.normalize(id));

      debugLog(`Called "transformInclude": ${JSON.stringify({ id })}`);
      debugLog(`Will transform "${id}": ${String(shouldTransform)}`);

      return shouldTransform;
    },

    /**
     * Responsible for injecting the global release value code.
     *
     * @param code Unprocessed code of the module.
     * @param id Always the absolute (fully resolved) path to the module.
     * @returns Code and source map if we decide to inject code. `undefined` otherwise.
     */
    transform(code, id) {
      if (entrypoints.has(path.normalize(id))) {
        const ms = new MagicString(code);
        ms.prepend(
          generateGlobalInjectorCode({ release: getReleaseName(options.release || "0.0.1") })
        );
        return {
          code: ms.toString(),
          map: ms.generateMap(),
        };
      } else {
        // Don't transform
        return undefined;
      }
    },
    buildEnd() {
      const sentryFacade = makeSentryFacade(getReleaseName(options.release || "0.0.1"), options);
      //TODO: do stuff with the facade here lol
      debugLog("this is my facade:", sentryFacade);
    },
  };
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryVitePlugin: (options: Options) => any = unplugin.vite;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryRollupPlugin: (options: Options) => any = unplugin.rollup;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryWebpackPlugin: (options: Options) => any = unplugin.webpack;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryEsbuildPlugin: (options: Options) => any = unplugin.esbuild;

export type { Options } from "./types";
