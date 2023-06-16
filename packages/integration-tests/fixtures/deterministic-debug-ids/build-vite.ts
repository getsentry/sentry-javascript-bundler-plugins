import { sentryVitePlugin } from "@sentry/vite-plugin";
import * as path from "path";
import * as vite from "vite";
import pluginOptions from "./plugin-options";

void vite.build({
  clearScreen: false,
  build: {
    outDir: path.join(__dirname, "out", "vite"),
    rollupOptions: {
      input: {
        index: path.join(__dirname, "input", "index.js"),
      },
      output: {
        format: "cjs",
        entryFileNames: "[name].js",
      },
    },
  },
  plugins: [sentryVitePlugin(pluginOptions)],
});
