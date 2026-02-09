import { SentryRollupPluginOptions } from "@sentry/rollup-plugin";
import { _rollupPluginInternal } from "@sentry/rollup-plugin";
import { Plugin } from "vite";

export const sentryVitePlugin = (options?: SentryRollupPluginOptions): Plugin[] => {
  return [
    {
      enforce: "pre",
      ..._rollupPluginInternal(options, "vite"),
    },
  ];
};

export type { Options as SentryVitePluginOptions } from "@sentry/bundler-plugin-core";
export { sentryCliBinaryExists } from "@sentry/bundler-plugin-core";
