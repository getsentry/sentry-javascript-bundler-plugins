# Migration Guide

This document serves as a migration guide, documenting all breaking changes between major versions of the Sentry bundler plugins.

## [Unreleased] Upgrading from 1.x to 2.x (Webpack Plugin Only)

Version 2 of `@sentry/webpack-plugin` is a complete rewrite of version 1, relying on bundler-agnostic code (based on [unjs/unplugin](https://github.com/unjs/unplugin)). While we tried to keep changes to v1 of the webpack plugin minimal, a adjustments are nevertheless necessary:

### Initialization and Required Values

Previously, to use the plugin, you had to create a new class of the `SentryCLIPlugin` class.
In version 2, you simply need to call a function and pass the initialization options to it:

```js
// old initialization:
new SentryCliPlugin({
  include: "./dist",
});

// new initialization:
sentryWebpackPlugin({
  include: "./dist",
});
```

### Replacing `entries` option with `releaseInjectionTargets`

Previously, the `entries` option was used to filter for _entrypoints_ that the plugin should inject the release into.
Releases were only injected into entrypoint files of a bundle.
In version 2, releases are injected into every module that is part of a bundle.
Don't worry, your bundler will only include the injected release code once.
Instead of using the `entries` option to filter for _entrypoints_, the `releaseInjectionTargets` option can now be used to filter for _modules_ that the plugin should inject the release into.
Matching behaviour stays the same.

### Injecting `SENTRY_RELEASES` Map

Previously, the webpack plugin always injected a `SENTRY_RELEASES` variable into the global object which would map from `project@org` to the `release` value. In version 2, we made this behaviour opt-in by setting the `injectReleasesMap` option in the plugin options to `true`.

The purpose of this option is to support module-federated projects or micro frontend setups where multiple projects would want to access the global release variable. However, Sentry SDKs by default never accessed this variable so it would require manual user-intervention to make use of it. Making this behaviour opt-in decreases the bundle size impact of our plugin for the majority of users.
