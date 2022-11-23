<p align="center">
  <a href="https://sentry.io/?utm_source=github&utm_medium=logo" target="_blank">
    <img src="https://sentry-brand.storage.googleapis.com/sentry-wordmark-dark-280x84.png" alt="Sentry" width="280" height="84">
  </a>
</p>

# Sentry Bundler Plugin Core

Core package containing the bundler-agnostic functionality used by the bundler plugins.

Check out the individual packages for more information and examples:

- [Rollup](https://github.com/getsentry/sentry-javascript-bundler-plugins/tree/main/packages/rollup-plugin)
- [Vite](https://github.com/getsentry/sentry-javascript-bundler-plugins/tree/main/packages/vite-plugin)
- [esbuild](https://github.com/getsentry/sentry-javascript-bundler-plugins/tree/main/packages/esbuild-plugin)
- [Webpack](https://github.com/getsentry/sentry-javascript-bundler-plugins/tree/main/packages/webpack-plugin)

### Features

The Sentry bundler plugin core package contains the following functionality:

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
