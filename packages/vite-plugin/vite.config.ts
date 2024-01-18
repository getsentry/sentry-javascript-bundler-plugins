import { defineConfig } from "vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import reactAnnotatePlugin from "./react-annotate";
import Inspect from "vite-plugin-inspect";

// https://vitejs.dev/config/
export default defineConfig({
  define: { "process.env.BABEL_TYPES_8_BREAKING": "false" },
  build: {
    sourcemap: true, // Source map generation must be turned on
  },
  plugins: [
    Inspect(),
    // react({
    //   babel: {
    //     plugins: [[reactAnnotatePlugin]],
    //   },
    // }),
    // Put the Sentry vite plugin after all other plugins
    sentryVitePlugin({
      org: "personal-organization-v3",
      project: "bundler-playground",

      // Auth tokens can be obtained from https://sentry.io/orgredirect/organizations/:orgslug/settings/auth-tokens/
      authToken:
        "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",
    }),
  ],
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: "globalThis",
      },
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
      ],
    },
  },
});
