// @ts-check
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import * as path from "path";

export default defineConfig({
  build: {
    outDir: "./out/vite",
    lib: {
      entry: path.resolve(__dirname, "src", "entrypoint1.js"),
      name: "ExampleBundle",
      fileName: "index",
      formats: ["cjs"],
    },
    sourcemap: true,
  },
  plugins: [
    sentryVitePlugin({
      debug: true,
    }),
  ],
});
