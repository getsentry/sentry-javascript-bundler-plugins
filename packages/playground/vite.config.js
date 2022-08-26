// @ts-check
import { sentryVitePlugin } from "@sentry/sentry-unplugin";
import { defineConfig } from "vite";
import * as path from "path";
import placeHolderOptions from "./config.json";

export default defineConfig({
  build: {
    outDir: "./out/vite",
    lib: {
      entry: path.resolve(__dirname, "./src/entrypoint1.js"),
      name: "ExampleBundle",
      fileName: "index",
      formats: ["cjs"],
    },
    sourcemap: true,
  },
  plugins: [
    sentryVitePlugin({
      ...placeHolderOptions,
    }),
  ],
});
