import { SentryRollupPluginOptions } from "@sentry/rollup-plugin";
import { _rollupPluginInternal } from "@sentry/rollup-plugin";
import vite, { Plugin } from "vite";

function getViteMajorVersion(): string | undefined {
  try {
    // The version export was only added in Vite v3?
    return vite?.version?.split(".")[0];
  } catch (err) {
    // do nothing, we'll just not report a version
  }

  return undefined;
}

export const sentryVitePlugin = (options?: SentryRollupPluginOptions): Plugin[] => {
  return [
    {
      enforce: "pre",
      ..._rollupPluginInternal(options, "vite", getViteMajorVersion()),
    },
  ];
};

export type { Options as SentryVitePluginOptions } from "@sentry/bundler-plugin-core";
export { sentryCliBinaryExists } from "@sentry/bundler-plugin-core";
