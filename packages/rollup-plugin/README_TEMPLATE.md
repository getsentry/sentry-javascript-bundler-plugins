<p align="center">
  <a href="https://sentry.io/?utm_source=github&utm_medium=logo" target="_blank">
    <img src="https://sentry-brand.storage.googleapis.com/sentry-wordmark-dark-280x84.png" alt="Sentry" width="280" height="84">
  </a>
</p>

# Sentry Rollup Plugin

[![npm version](https://img.shields.io/npm/v/@sentry/rollup-plugin.svg)](https://www.npmjs.com/package/@sentry/rollup-plugin)
[![npm dm](https://img.shields.io/npm/dm/@sentry/rollup-plugin.svg)](https://www.npmjs.com/package/@sentry/rollup-plugin)
[![npm dt](https://img.shields.io/npm/dt/@sentry/rollup-plugin.svg)](https://www.npmjs.com/package/@sentry/rollup-plugin)

> A Rollup plugin that provides source map and release management support for Sentry.

## Installation

Using npm:

```bash
npm install @sentry/rollup-plugin --save-dev
```

Using yarn:

```bash
yarn add @sentry/rollup-plugin --dev
```

Using pnpm:

```bash
pnpm install @sentry/rollup-plugin --dev
```

## Example

```js
// rollup.config.js
import { sentryRollupPlugin } from "@sentry/rollup-plugin";

export default {
  plugins: [
    // Put the Sentry rollup plugin after all other plugins
    sentryRollupPlugin({
      org: "___ORG_SLUG___",
      project: "___PROJECT_SLUG___",

      // Auth tokens can be obtained from https://sentry.io/settings/account/api/auth-tokens/
      // and need `project:releases` and `org:read` scopes
      authToken: env.SENTRY_AUTH_TOKEN,

      sourcemaps: {
        // Specify the directory containing build artifacts
        assets: "./**",
        // Don't upload the source maps of dependencies
        ignore: ["./node_modules/**"],
      },

      // Helps troubleshooting - set to false to make plugin less noisy
      debug: true,

      // Use the following option if you're on an SDK version lower than 7.47.0:
      // include: "./dist",

      // Optionally uncomment the line below to override automatic release name detection
      // release: env.RELEASE,
    }),
  ],
  output: {
    sourcemap: true, // Source map generation must be turned on
  },
};
```

#OPTIONS_SECTION_INSERT#

## More information

- [Sentry Documentation](https://docs.sentry.io/quickstart/)
- [Sentry Discord](https://discord.gg/Ww9hbqr)
- [Sentry Stackoverflow](http://stackoverflow.com/questions/tagged/sentry)
