import { createUnplugin } from "unplugin";
import MagicString from "magic-string";
import { getReleaseName } from "./getReleaseName";
import { Options } from "./types";
import { makeSentryFacade } from "./sentry/facade";

const defaultOptions: Omit<Options, "include"> = {
  //TODO: add default options here as we port over options from the webpack plugin
  // validate: false
  configFile: "~/.sentryclirc",
  debug: false,
  cleanArtifacts: false,
  finalize: true,
  url: "https://sentry.io",
  ext: ["js", "map", "jsbundle", "bundle"],
};

// We prefix the polyfill id with \0 to tell other plugins not to try to load or transform it.
// This hack is taken straight from https://rollupjs.org/guide/en/#resolveid.
// This probably doesn't work for all bundlers but for rollup it does.
const RELEASE_INJECTOR_ID = "\0sentry-release-injector";

/**
 * The sentry-unplugin concerns itself with two things:
 * - Release injection
 * - Sourcemaps upload
 *
 * Release injection:
 *
 * Per default the sentry-unpugin will inject a global `SENTRY_RELEASE` variable into the entrypoint of all bundles. On
 * a technical level this is done by appending an import (`import "sentry-release-injector;"`) to all entrypoint files
 * of the user code (see `transformInclude` and `transform` hooks). This import is then resolved by the sentry-unplugin
 * to a virtual module that sets the global variable (see `resolveId` and `load` hooks).
 *
 * The resulting output approximately looks like this:
 *
 * ```text
 *                               entrypoint1.js (user file)
 *  ┌───────────────────┐        ┌─────────────────────────────────────────────────┐
 *  │                   │        │  import { myFunction } from "./my-library.js";  │
 *  │  sentry-unplugin  │        │                                                 │
 *  │                   │        │  const myResult = myFunction();                 │
 *  └---------│---------┘        │  export { myResult };                           │
 *            │                  │                                                 │
 *            │      injects     │  // injected by sentry-unplugin                 │
 *            ├───────────────────► import "sentry-release-injector"; ─────────────────────┐
 *            │                  └─────────────────────────────────────────────────┘       │
 *            │                                                                            │
 *            │                                                                            │
 *            │                  entrypoint2.js (user file)                                │
 *            │                  ┌─────────────────────────────────────────────────┐       │
 *            │                  │  export function myFunction() {                 │       │
 *            │                  │    return "Hello world!";                       │       │
 *            │                  │  }                                              │       │
 *            │                  │                                                 │       │
 *            │      injects     │  // injected by sentry-unplugin                 │       │
 *            └───────────────────► import "sentry-release-injector"; ─────────────────────┤
 *                               └─────────────────────────────────────────────────┘       │
 *                                                                                         │
 *                                                                                         │
 *                               sentry-release-injector                                   │
 *                               ┌──────────────────────────────────┐                      │
 *                               │                                  │    is resolved       │
 *                               │  global.SENTRY_RELEASE = { ... } │    by unplugin       │
 *                               │  // + a little more logic        │<─────────────────────┘
 *                               │                                  │    (only once)
 *                               └──────────────────────────────────┘
 * ```
 *
 * Source maps upload:
 *
 * The sentry-unplugin will also take care of uploading source maps to Sentry. This is all done in the `buildEnd` hook.
 * TODO: elaborate a bit on how sourcemaps upload works
 */
const unplugin = createUnplugin<Options>((originalOptions, unpluginMetaContext) => {
  const options = { ...defaultOptions, ...originalOptions };

  function debugLog(...args: unknown[]) {
    if (options?.debugLogging) {
      // eslint-disable-next-line no-console
      console.log("[Sentry-plugin]", ...args);
    }
  }

  // This is `nonEntrypointSet` instead of `entrypointSet` because this set is filled in the `resolveId` hook and there
  // we don't have guaranteed access to *absolute* paths of files if they're entrypoints. For non-entrypoints we're
  // guaranteed to have absolute paths - we're then using the paths in later hooks to make decisions about whether a
  // file is an entrypoint or a non-entrypoint.
  const nonEntrypointSet = new Set<string>();

  return {
    name: "sentry-plugin",
    enforce: "pre", // needed for Vite to call resolveId hook

    /**
     * Responsible for returning the "sentry-release-injector" ID when we encounter it. We return the ID so load is
     * called and we can "virtually" load the module. See `load` hook for more info on why it's virtual.
     *
     * We also record the id (i.e. absolute path) of any non-entrypoint.
     *
     * @param id For imports: The absolute path of the module to be imported. For entrypoints: The path the user defined as entrypoint - may also be relative.
     * @param importer For imports: The absolute path of the module that imported this module. For entrypoints: `undefined`.
     * @param options Additional information to use for making a resolving decision.
     * @returns `"sentry-release-injector"` when the imported file is called `"sentry-release-injector"`. Otherwise returns `undefined`.
     */
    resolveId(id, importer, { isEntry }) {
      debugLog(
        `Called "resolveId": ${JSON.stringify({ id, importer: importer, options: { isEntry } })}`
      );

      if (!isEntry) {
        nonEntrypointSet.add(id);
      }

      if (id === RELEASE_INJECTOR_ID) {
        return RELEASE_INJECTOR_ID;
      } else {
        return undefined;
      }
    },

    loadInclude(id) {
      debugLog(`Called "loadInclude": ${JSON.stringify({ id })}`);

      return id === RELEASE_INJECTOR_ID;
    },

    /**
     * Responsible for "virtually" loading the "sentry-release-injector" module. "Virtual" means that the module is not
     * read from somewhere on disk but rather just returned via a string.
     *
     * @param id Always the absolute (fully resolved) path to the module.
     * @returns The global injector code when we load the "sentry-release-injector" module. Otherwise returns `undefined`.
     */
    load(id) {
      debugLog(`Called "transform": ${JSON.stringify({ id })}`);

      if (id === RELEASE_INJECTOR_ID) {
        return generateGlobalInjectorCode({ release: getReleaseName(options.release) });
      } else {
        return undefined;
      }
    },

    /**
     * This hook determines whether we want to transform a module. In the unplugin we want to transform every entrypoint
     * unless configured otherwise with the `entries` option.
     *
     * @param id Always the absolute (fully resolved) path to the module.
     * @returns `true` or `false` depending on whether we want to transform the module. For the sentry-unplugin we only
     * want to transform the release injector file.
     */
    transformInclude(id) {
      debugLog(`Called "transformInclude": ${JSON.stringify({ id })}`);

      if (options.entries) {
        // If there's an `entries` option transform (ie. inject the release varible) when the file path matches the option.
        if (typeof options.entries === "function") {
          return options.entries(id);
        }

        const arrayifiedEntriesOption = Array.isArray(options.entries)
          ? options.entries
          : [options.entries];

        return arrayifiedEntriesOption.some((entry) => {
          if (entry instanceof RegExp) {
            return entry.test(id);
          } else {
            return id === entry;
          }
        });
      }

      // We want to transform (release injection) every module except for "sentry-release-injector".
      return id !== RELEASE_INJECTOR_ID && !nonEntrypointSet.has(id);
    },

    /**
     * This hook is responsible for injecting the "sentry release injector" imoprt statement into each entrypoint unless
     * configured otherwise with the `entries` option (logic for that is in the `transformInclude` hook).
     *
     * @param code Code of the file to transform.
     * @param id Always the absolute (fully resolved) path to the module.
     * @returns transformed code + source map
     */
    transform(code, id) {
      debugLog(`Called "transform": ${JSON.stringify({ code, id })}`);

      // The MagicString library allows us to generate sourcemaps for the changes we make to the user code.
      const ms: MagicString = new MagicString(code); // Very stupid author's note: For some absurd reason, when we add a JSDoc to this hook, the TS language server starts complaining about `ms` and adding a type annotation helped so that's why it's here. (┛ಠ_ಠ)┛彡┻━┻

      // appending instead of prepending has less probability of mucking with user'sadly
      // source maps and import statements get to the top anyways
      ms.append(`import "${RELEASE_INJECTOR_ID}";`);

      if (unpluginMetaContext.framework === "esbuild") {
        // esbuild + unplugin is buggy at the moment when we return an object with a `map` (sourcemap) property.
        // Currently just returning a string here seems to work and even correctly sourcemaps the code we generate.
        // However, other bundlers need the `map` property
        return ms.toString();
      } else {
        return {
          code: ms.toString(),
          map: ms.generateMap(),
        };
      }
    },
    buildEnd() {
      const release = getReleaseName(options.release);
      //TODO:
      //  1. validate options to see if we get a valid include property, release name, etc.
      //  2. normalize the include property: Users can pass string | string [] | IncludeEntry[].
      //     That's good for them but a hassle for us. Let's try to normalize this into one data type
      //     (I vote IncludeEntry[]) and continue with that down the line

      const sentryFacade = makeSentryFacade(release, options);

      sentryFacade
        .createNewRelease()
        .then(() => sentryFacade.cleanArtifacts())
        .then(() => sentryFacade.uploadSourceMaps())
        .then(() => sentryFacade.setCommits()) // this is a noop for now
        .then(() => sentryFacade.finalizeRelease())
        .then(() => sentryFacade.addDeploy()) // this is a noop for now
        .catch((e) => {
          //TODO: invoke error handler here
          // https://github.com/getsentry/sentry-webpack-plugin/blob/137503f3ac6fe423b16c5c50379859c86e689017/src/index.js#L540-L547
          debugLog(e);
        });
    },
  };
});

/**
 * Generates code for the "sentry-release-injector" which is responsible for setting the global `SENTRY_RELEASE`
 * variable.
 */
function generateGlobalInjectorCode({ release }: { release: string }) {
  // The code below is mostly ternary operators because it saves bundle size.
  // The checks are to support as many environments as possible. (Node.js, Browser, webworkers, etc.)
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryVitePlugin: (options: Options) => any = unplugin.vite;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryRollupPlugin: (options: Options) => any = unplugin.rollup;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryWebpackPlugin: (options: Options) => any = unplugin.webpack;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sentryEsbuildPlugin: (options: Options) => any = unplugin.esbuild;

export type { Options } from "./types";
