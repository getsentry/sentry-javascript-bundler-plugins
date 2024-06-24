<p align="center">
  <a href="https://sentry.io/?utm_source=github&utm_medium=logo" target="_blank">
    <img src="https://sentry-brand.storage.googleapis.com/sentry-wordmark-dark-280x84.png" alt="Sentry" width="280" height="84">
  </a>
</p>

# Sentry Bundler Plugins

Sentry plugins for various JavaScript bundlers. Currently supporting Rollup, Vite, esbuild, Webpack 4 and Webpack 5.

Check out the individual packages for more information and examples:

- [Rollup](https://www.npmjs.com/package/@sentry/rollup-plugin)
- [Vite](https://www.npmjs.com/package/@sentry/vite-plugin)
- [esbuild](https://www.npmjs.com/package/@sentry/esbuild-plugin)
- [Webpack](https://www.npmjs.com/package/@sentry/webpack-plugin)

### Features

The Sentry Bundler Plugins take care of Sentry-related tasks at build time of your JavaScript projects. It supports the following features:

- Sourcemap upload
- Release creation in Sentry
- Automatic release name discovery (based on CI environment - Vercel, AWS, Heroku, CircleCI, or current Git SHA)
- Automatically associate errors with releases (Release injection)

### More information

- [Sentry Documentation](https://docs.sentry.io/quickstart/)
- [Sentry Discord](https://discord.gg/Ww9hbqr)
- [Sentry Stackoverflow](http://stackoverflow.com/questions/tagged/sentry)

## Contributors

Thanks to everyone who contributed to the Sentry JavaScript Bundler Plugins!

<a href="https://github.com/getsentry/sentry-javascript-bundler-plugins/graphs/contributors">
  <img src="https://contributors-img.web.app/image?repo=getsentry/sentry-javascript-bundler-plugins" />
</a>
