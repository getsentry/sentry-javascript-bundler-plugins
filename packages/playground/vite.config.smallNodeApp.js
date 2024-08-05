// @ts-check
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import * as path from "path";

export default defineConfig({
  build: {
    outDir: "./out/vite-smallNodeApp",
    lib: {
      entry: path.resolve(__dirname, "src", "smallNodeApp.js"),
      name: "ExampleBundle",
      fileName: "index",
      formats: ["cjs"],
    },
    sourcemap: true,
    minify: true,
  },
  plugins: [
    sentryVitePlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN || "",
      org: process.env.SENTRY_ORG || "",
      project: process.env.SENTRY_PROJECT || "",
      debug: true,
      release: "0.0.14",
      include: "out/vite-smallNodeApp",
      // ignore: ["out/*", "!out/vite-smallNodeApp/index.js.map"],
      ignore: ["!out/vite-smallNodeApp/index.js.map"],
      ignoreFile: ".sentryignore",
      setCommits: {
        repo: "someRepo",
        commit: "someCommit",
        ignoreMissing: true,
      },
      deploy: {
        env: "myEnv",
        time: 10,
      },
    }),
  ],
});
