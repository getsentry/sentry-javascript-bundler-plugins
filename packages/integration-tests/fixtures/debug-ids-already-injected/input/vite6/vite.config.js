import { defineConfig } from "vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  clearScreen: false,
  mode: "production",
  build: {
    sourcemap: true,
    outDir: join(__dirname, "..", "..", "out", "vite6"),
    rollupOptions: {
      input: { index: join(__dirname, "..", "bundle.js") },
      output: {
        format: "cjs",
        entryFileNames: "[name].js",
        sourcemapDebugIds: true,
      },
    },
  },
  plugins: [
    sentryVitePlugin({
      telemetry: false,
      authToken: "fake-auth",
      org: "fake-org",
      project: "fake-project",
    }),
  ],
});
