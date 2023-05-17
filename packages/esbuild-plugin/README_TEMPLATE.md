<p align="center">
  <a href="https://sentry.io/?utm_source=github&utm_medium=logo" target="_blank">
    <img src="https://sentry-brand.storage.googleapis.com/sentry-wordmark-dark-280x84.png" alt="Sentry" width="280" height="84">
  </a>
</p>

# Sentry Esbuild Plugin

[![npm version](https://img.shields.io/npm/v/@sentry/esbuild-plugin.svg)](https://www.npmjs.com/package/@sentry/esbuild-plugin)
[![npm dm](https://img.shields.io/npm/dm/@sentry/esbuild-plugin.svg)](https://www.npmjs.com/package/@sentry/esbuild-plugin)
[![npm dt](https://img.shields.io/npm/dt/@sentry/esbuild-plugin.svg)](https://www.npmjs.com/package/@sentry/esbuild-plugin)

> An esbuild plugin that provides source map and release management support for Sentry.

## Installation

Using npm:

```bash
npm install @sentry/esbuild-plugin --save-dev
```

Using yarn:

```bash
yarn add @sentry/esbuild-plugin --dev
```

Using pnpm:

```bash
pnpm install @sentry/esbuild-plugin --dev
```

## Example

```js
// esbuild.config.js
const { sentryEsbuildPlugin } = require("@sentry/esbuild-plugin");

require("esbuild").build({
  plugins: [
    sentryEsbuildPlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        assets: "./**",
        ignore: ["./node_modules/**"],
      },

      // Set to false to make plugin less noisy
      debug: true,
    }),
  ],
});
```

#OPTIONS_SECTION_INSERT#

## More information

- [Sentry Documentation](https://docs.sentry.io/quickstart/)
- [Sentry Discord](https://discord.gg/Ww9hbqr)
- [Sentry Stackoverflow](http://stackoverflow.com/questions/tagged/sentry)
