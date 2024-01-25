# Migration Guide

This document serves as a migration guide, documenting all breaking changes between major versions of the Sentry bundler plugins.

## Upgrading to 2.x

- Removed `injectReleasesMap` option. If you need to inject values based on the build, please use your bundler's way of injecting values ([rollup](https://www.npmjs.com/package/@rollup/plugin-replace), [vite](https://vitejs.dev/config/shared-options.html#define), [webpack](https://webpack.js.org/plugins/define-plugin/), [esbuild](https://esbuild.github.io/api/#define)).
- The minimum compatible version of rollup is version `3.2.0`.
- Removed functionality for the `releaseInjectionTargets` option.
- `@sentry/bundler-plugin-core` will no longer export the individual plugins but a factory function to create them.
- Removed `customHeader` option in favor of `headers` option which allows for multiple headers to be attached to outgoing requests.
- The `cliBinaryExists` function was renamed to `sentryCliBinaryExists`
- Removed the `configFile` option. Options should now be set explicitly or via environment variables.
  This also means that `.sentryclirc` files will no longer work as a means of configuration.
  Please manually pass in options, or use a configuration file ([Webpack plugin docs](https://www.npmjs.com/package/@sentry/webpack-plugin#configuration-file), [Vite plugin docs](https://www.npmjs.com/package/@sentry/vite-plugin#configuration-file), [esbuild plugin docs](https://www.npmjs.com/package/@sentry/esbuild-plugin#configuration-file), [Rollup plugin docs](https://www.npmjs.com/package/@sentry/rollup-plugin#configuration-file)).
- The minimum supported Node.js version is now 14 and newer.
- Removed `dryRun` option.

## Upgrading from 1.x to 2.x (Webpack Plugin Only)

Version 2 of `@sentry/webpack-plugin` is a complete rewrite of version 1, relying on bundler-agnostic code (based on [unjs/unplugin](https://github.com/unjs/unplugin)). While we tried to keep changes to v1 of the webpack plugin minimal, a adjustments are nevertheless necessary:

### Initialization and Required Values

Previously, to use the plugin, you had to create a new class of the `SentryCLIPlugin` class.
In version 2, you simply need to call a function and pass the initialization options to it:

```js
// old initialization:
import SentryCliPlugin from "@sentry/webpack-plugin";
new SentryCliPlugin({
  // ... options
});

// new initialization:
import { sentryWebpackPlugin } from "@sentry/webpack-plugin";
sentryWebpackPlugin({
  // ... options
});
```

### Removal of `include` for `sourcemap` option

The `include` option was removed in favour of the new `sourcemaps` option. If you cannot migrate to the `sourcemaps`, `include` is still avaliable as the `uploadLegacySourcemaps` option.

Use the `sourcemaps.assets` and `sourcemaps.ignore` options to indicate to the plugin which sourcemaps should be uploaded to Sentry. The plugin now also exposes `sourcemaps.deleteAfterUpload` to delete your sourcemaps after they have been uploaded to Sentry. With the `sourcemaps` options, you no longer need to set filename transforms like `urlPrefix` because the plugin uses a new debug IDs system to associate sourcemaps to your bundles.

```js
// old initialization:
import SentryWebpackPlugin from "@sentry/webpack-plugin";
new SentryWebpackPlugin({
  include: {
    paths: ["./path1", "./path2"],
    ignore: ["./path2/ignore"],
    urlPrefix: "~/static/js",
  },
});

// new initialization:
import { sentryWebpackPlugin } from "@sentry/webpack-plugin";
sentryWebpackPlugin({
  sourcemaps: {
    assets: ["./path1/**", "./path2/**"],
    ignore: ["./path2/ignore/**"],
    deleteFilesAfterUpload: ["./path1/**/*.map", "./path2/**/*.map"],
  },
});
```

## Upgrading from 0.3.x to 0.4.x

### Replacing default exports with named exports

Previously all the plugins were exported as default exports.
Moving forward, with version `0.4.x` of the plugins, all exports become named exports:

```ts
import sentryVitePlugin from "@sentry/vite-plugin";
// becomes
import { sentryVitePlugin } from "@sentry/vite-plugin";

import sentryEsbuildPlugin from "@sentry/esbuild-plugin";
// becomes
import { sentryEsbuildPlugin } from "@sentry/esbuild-plugin";

import sentryRollupPlugin from "@sentry/rollup-plugin";
// becomes
import { sentryRollupPlugin } from "@sentry/rollup-plugin";
```

### Renaming of `Options` type export

The `Options` type was a bit too generic for our taste so we renamed it:

```ts
import type { Options } from "@sentry/vite-plugin";
// becomes
import type { SentryVitePluginOptions } from "@sentry/vite-plugin";

import type { Options } from "@sentry/esbuild-plugin";
// becomes
import type { SentryEsbuildPluginOptions } from "@sentry/esbuild-plugin";

import type { Options } from "@sentry/rollup-plugin";
// becomes
import type { SentryRollupPluginOptions } from "@sentry/rollup-plugin";
```

### Behavioral change of `releaseInjectionTargets`

Previously the plugins injected a Sentry release value into every module that was processed.
This approach caused problems in some cases so moving forward, they will only inject the release value into entrypoints by default.

In case you need more fine grained control over which modules should have a release value, you can use the `releaseInjectionTargets` option.

### Removal of `customHeader` option

We removed the `customHeader` option in favor of the `headers` option.
