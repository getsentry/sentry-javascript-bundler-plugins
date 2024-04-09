<p align="center">
  <a href="https://sentry.io/?utm_source=github&utm_medium=logo" target="_blank">
    <img src="https://sentry-brand.storage.googleapis.com/sentry-wordmark-dark-280x84.png" alt="Sentry" width="280" height="84">
  </a>
</p>

# Sentry Vite Plugin

[![npm version](https://img.shields.io/npm/v/@sentry/vite-plugin.svg)](https://www.npmjs.com/package/@sentry/vite-plugin)
[![npm dm](https://img.shields.io/npm/dm/@sentry/vite-plugin.svg)](https://www.npmjs.com/package/@sentry/vite-plugin)
[![npm dt](https://img.shields.io/npm/dt/@sentry/vite-plugin.svg)](https://www.npmjs.com/package/@sentry/vite-plugin)

> A Vite plugin that provides source map and release management support for Sentry.

## Installation

Using npm:

```bash
npm install @sentry/vite-plugin --save-dev
```

Using yarn:

```bash
yarn add @sentry/vite-plugin --dev
```

Using pnpm:

```bash
pnpm add @sentry/vite-plugin --save-dev
```

## Example

```ts
// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true, // Source map generation must be turned on
  },
  plugins: [
    vue(),

    // Put the Sentry vite plugin after all other plugins
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,

      // Auth tokens can be obtained from https://sentry.io/orgredirect/organizations/:orgslug/settings/auth-tokens/
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
});
```

#OPTIONS_SECTION_INSERT#

### Configuration File

As an additional configuration method, the Sentry Vite plugin will pick up environment variables configured inside a `.env.sentry-build-plugin` file located in the current working directory when building your app.

## More information

- [Sentry Documentation](https://docs.sentry.io/quickstart/)
- [Sentry Discord](https://discord.gg/Ww9hbqr)
- [Sentry Stackoverflow](http://stackoverflow.com/questions/tagged/sentry)
