<p align="center">
  <a href="https://sentry.io/?utm_source=github&utm_medium=logo" target="_blank">
    <img src="https://sentry-brand.storage.googleapis.com/sentry-wordmark-dark-280x84.png" alt="Sentry" width="280" height="84">
  </a>
</p>

# Sentry Unplugin

**DISCLAIMER: This package is work in progress and not production ready. Use with caution. We're happy to receive your feedback!**

Universal Sentry plugin for various JavaScript bundlers. Based on [unjs/uplugin](https://github.com/unjs/unplugin). Currently supports Rollup, Vite, esbuild, Webpack 4 and Webpack 5.

Check out the individual packages for more information and examples:

- [Rollup](https://github.com/getsentry/hackweek-sentry-unplugin/tree/main/packages/rollup-plugin)
- [Vite](https://github.com/getsentry/hackweek-sentry-unplugin/tree/main/packages/vite-plugin)
- [esbuild](https://github.com/getsentry/hackweek-sentry-unplugin/tree/main/packages/esbuild-plugin)
- [Webpack](https://github.com/getsentry/hackweek-sentry-unplugin/tree/main/packages/webpack-plugin)

### Features

The Sentry Unplugin supports [Sentry CLI](https://docs.sentry.io/learn/cli/) features required for node environments:

- Sourcemap upload
- Release creation in Sentry
- Automatic release name discovery (based on CI environment - Vercel, AWS, Heroku, CircleCI, or current Git SHA)
- Automatically associate errors with releases (Release injection)

### More information

- [Sentry Documentation](https://docs.sentry.io/quickstart/)
- [Troubleshooting Sourcemaps](https://docs.sentry.io/platforms/javascript/sourcemaps/troubleshooting_js/)
- [Sentry CLI](https://docs.sentry.io/learn/cli/)
- [Sentry Discord](https://discord.gg/Ww9hbqr)
- [Sentry Stackoverflow](http://stackoverflow.com/questions/tagged/sentry)
