import { sentryVitePlugin } from "@sentry/vite-plugin";
import * as path from "path";
import * as vite from "vite";

const inputDir = path.join(__dirname, "input");

void vite.build({
  clearScreen: false,
  root: inputDir,
  build: {
    sourcemap: true,
    outDir: path.join(__dirname, "out", "with-plugin"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: path.join(inputDir, "index.html"),
        page1: path.join(inputDir, "page1.html"),
        page2: path.join(inputDir, "page2.html"),
      },
    },
  },
  plugins: [
    sentryVitePlugin({
      telemetry: false,
      // Empty options - the issue says options don't affect the results
    }),
  ],
});
