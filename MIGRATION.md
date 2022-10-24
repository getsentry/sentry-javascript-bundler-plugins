# Migration Guide

This document serves as a migration guide, documenting all breaking changes between major versions of the Sentry bundler plugins.

## [Unreleased] Upgrading from 1.x to 2.x

Version 2 of `@sentry/webpack-plugin` is a complete rewrite of version 1. Version 2 no longer requires `sentry-cli` underneath, meaning the plugin no longer downloads a binary but implements all its functionality natively.

### Removal of Implicit Environment Variable Usage

Version 2 of the Webpack plugin removes the implicit passing of plugin parameters via environment variables. Previously, it was possible to specify values as environment variables, such as SENTRY_AUTH_TOKEN, but to never mention them in the plugin init options. In this version, you'll have to specify these values in the options. Note that this makes certain option fields explicitly required now which were previously only implicitly required (see [Initialization and Required Values](#initialization-and-required-values)).

### Initialization and Required Values

Previously, to use the plugin, you had to create a new class of the `SentryCLIPlugin` class. In version 2, you simply need to call a function and pass the initialization options to it. Note that in this new version, more options are now explicitly required. Here's an example:

```js
// old config + environment variables were set for authToken, org and project
new SentryCliPlugin({
  include: "./dist",
});

// new config (you can still use env variables but you need to set them explicitly):
sentryWebpackPlugin({
  include: "./dist",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});
```

### Removal of `configFile` option

Previously, you could set the `configFile` option when initializing the plugin to point `sentry-cli` to its `.sentryclirc` config. Because `sentry-cli` is no longer part of the plugin, this is option was removed.
If you previously used this option, make sure to specify all required options when intializing the plugin (see [Initialization and Required Values](#initialization-and-required-values)).
