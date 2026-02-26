import { sentryVitePlugin } from "@sentry/vite-plugin";
import * as path from "path";
import * as vite from "vite";
import pluginOptions from "./plugin-options";

vite
  .build({
    clearScreen: false,
    build: {
      outDir: path.join(__dirname, "out", "vite"),
      rollupOptions: {
        input: {
          index: path.join(__dirname, "input", "bundle.js"),
        },
        output: {
          format: "cjs",
          entryFileNames: "[name].js",
        },
      },
    },
    plugins: [sentryVitePlugin(pluginOptions) as unknown as vite.Plugin],
  })
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  });
