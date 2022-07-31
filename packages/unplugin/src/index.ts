import { createUnplugin } from "unplugin";
import MagicString from "magic-string";
import * as path from "path";

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

// TODO: Replace this function with actual logic
function getReleaseName() {
  return "default";
}

export interface Options {
  debugLogging?: boolean;
}

const unplugin = createUnplugin<Options>((options) => {
  function debugLog(message: string) {
    if (options?.debugLogging) {
      // eslint-disable-next-line no-console
      console.log(`[Sentry-plugin] ${message}`);
    }
  }

  const entrypoints = new Set<string>();

  return {
    name: "sentry-plugin",
    enforce: "pre", // needed for Vite to call resolveId hook
    resolveId(id, _importer, { isEntry }) {
      debugLog(
        `Called "resolveId": ${JSON.stringify({ id, importer: _importer, options: { isEntry } })}`
      );

      if (isEntry) {
        const entrypoint = path.normalize(path.isAbsolute(id) ? id : path.join(process.cwd(), id));
        entrypoints.add(entrypoint);
        debugLog(`Added entrypoint: ${entrypoint}`);
      }

      return undefined;
    },
    transformInclude(id) {
      const shouldTransform = entrypoints.has(id);

      debugLog(`Called "transformInclude": ${JSON.stringify({ id })}`);
      debugLog(`Will transform "${id}": ${String(shouldTransform)}`);

      return shouldTransform;
    },
    transform(code, id) {
      if (entrypoints.has(path.normalize(id))) {
        const ms = new MagicString(code);
        ms.prepend(generateGlobalInjectorCode({ release: getReleaseName() }));
        return {
          code: ms.toString(),
          map: ms.generateMap(),
        };
      } else {
        // Don't transform
        return undefined;
      }
    },
  };
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryVitePlugin: (options?: Options | undefined) => any = unplugin.vite;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryRollupPlugin: (options?: Options | undefined) => any = unplugin.rollup;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryWebpackPlugin: (options?: Options | undefined) => any = unplugin.webpack;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryEsbuildPlugin: (options?: Options | undefined) => any = unplugin.esbuild;
