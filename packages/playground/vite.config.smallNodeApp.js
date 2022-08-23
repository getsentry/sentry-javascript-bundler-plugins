// @ts-check
import { sentryVitePlugin } from "@sentry/unplugin";
import { defineConfig } from "vite";
import * as path from "path";

export default defineConfig({
  build: {
    outDir: "./out/vite-smallNodeApp",
    lib: {
      entry: path.resolve(__dirname, "./src/smallNodeApp.js"),
      name: "ExampleBundle",
      fileName: "index",
      formats: ["cjs"],
    },
    sourcemap: true,
    minify: true,
  },
  plugins: [
    sentryVitePlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: "lms-testorg-9m",
      project: "hackweek-node-sample-app",
      debug: true,
      debugLogging: true,
      release: "0.0.6",
      include: "out/vite-smallNodeApp",
      cleanArtifacts: true,
    }),
  ],
});
