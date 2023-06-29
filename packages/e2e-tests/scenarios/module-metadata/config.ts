import { Options } from "@sentry/bundler-plugin-core";

/**
 * The Sentry bundler plugin config object used for this test
 */
export const pluginConfig: Options = {
  release: {
    name: "basic-upload",
  },
  _experiments: {
    moduleMetadata: { team: "frontend" },
  },
};
