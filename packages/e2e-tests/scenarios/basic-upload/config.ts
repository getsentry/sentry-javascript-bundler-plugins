import { Options } from "@sentry/bundler-plugin-core";
import * as path from "path";

/**
 * The Sentry bundler plugin config object used for this test
 */
export const pluginConfig: Options = {
  release: {
    name: "basic-upload",
    uploadLegacySourcemaps: path.resolve(__dirname, "out"),
  },
  authToken: process.env["SENTRY_AUTH_TOKEN"] || "",
  org: "sentry-sdks",
  project: "js-bundler-plugin-e2e-tests",
};
