<p align="center">
  <a href="https://sentry.io/?utm_source=github&utm_medium=logo" target="_blank">
    <img src="https://sentry-brand.storage.googleapis.com/sentry-wordmark-dark-280x84.png" alt="Sentry" width="280" height="84">
  </a>
</p>

# Sentry Unplugin

Unified plugin for build tools. Based on [unjs/uplugin](https://github.com/unjs/unplugin). The list of currently supported bundlers can be found on the [unplugin page](https://github.com/unjs/unplugin).

Sentry Unplugin supports [Sentry CLI](https://docs.sentry.io/learn/cli/) features required for node environments.

### Features

- Sourcemap upload
- Release name discovery
- Release creation in Sentry

### Vendors supported for auto release discovery

- Heroku
- AWS
- CircleCI
- Vercel

Release name can always be overwritten by setting the ENV var `SENTRY_RELEASE`.

### Configuration

You have to create the `.env` file and setup the ENV variables. The example is located in [.env.example](./packages/playground/.env.example).

#### Options

| Option         | Type                                                                                | Required | Description                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------- | ----------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| include        | `string`/`array`/`object`                                                           | required | One or more paths that Sentry CLI should scan recursively for sources. It will upload all `.map` files and match associated `.js` files. Each path can be given as an object with path-specific options. See [table below](#include) for details.                                                                                                                                                                              |
| org            | `string`                                                                            | optional | The slug of the Sentry organization associated with the app. Can also be specified via `process.env.SENTRY_ORG`.                                                                                                                                                                                                                                                                                                               |
| project        | `string`                                                                            | optional | The slug of the Sentry project associated with the app. Can also be specified via `process.env.SENTRY_PROJECT`.                                                                                                                                                                                                                                                                                                                |
| authToken      | `string`                                                                            | optional | The authentication token to use for all communication with Sentry. Can be obtained from https://sentry.io/settings/account/api/auth-tokens/. Required scopes: `project:releases` (and `org:read` if `setCommits` option is used).                                                                                                                                                                                              |
| url            | `string`                                                                            | optional | The base URL of your Sentry instance. Defaults to https://sentry.io/, which is the correct value for SAAS customers.                                                                                                                                                                                                                                                                                                           |
| release        | `string`                                                                            | optional | Unique identifier for the release. Can also be specified via `process.env.SENTRY_RELEASE`. Defaults to the output of the `sentry-cli releases propose-version` command, which automatically detects values for Cordova, Heroku, AWS CodeBuild, CircleCI, Xcode, and Gradle, and otherwise uses `HEAD`'s commit SHA. (**For `HEAD` option, requires access to `git` CLI and for the root directory to be a valid repository**). |
| entries        | `array`/`RegExp`/`function(key: string): bool`                                      | optional | Filter for entry points that should be processed. By default, the release will be injected into all entry points.                                                                                                                                                                                                                                                                                                              |
| configFile     | `string`                                                                            | optional | Path to Sentry CLI config properties, as described in https://docs.sentry.io/product/cli/configuration/#configuration-file. By default, the config file is looked for upwards from the current path, and defaults from `~/.sentryclirc` are always loaded                                                                                                                                                                      |
| ext            | `array`                                                                             | optional | The file extensions to be considered. By default the following file extensions are processed: `js`, `map`, `jsbundle`, and `bundle`.                                                                                                                                                                                                                                                                                           |
| finalize       | `boolean`                                                                           | optional | Determines whether Sentry release record should be automatically finalized (`date_released` timestamp added) after artifact upload. Defaults to `true`                                                                                                                                                                                                                                                                         |
| debug          | `boolean`                                                                           | optional | Print useful debug information. Defaults to `false`.                                                                                                                                                                                                                                                                                                                                                                           |
| cleanArtifacts | `boolean`                                                                           | optional | Remove all the artifacts in the release before the upload. Defaults to `false`.                                                                                                                                                                                                                                                                                                                                                |
| errorHandler   | `function(err: Error, invokeErr: function(): void, compilation: Compilation): void` | optional | Function to call a when CLI error occurs. Webpack compilation failure can be triggered by calling `invokeErr` callback. Can emit a warning rather than an error (allowing compilation to continue) by setting this to `(err, invokeErr, compilation) => { compilation.warnings.push('Sentry CLI Plugin: ' + err.message) }`. Defaults to `(err, invokeErr) => { invokeErr() }`.                                                |

#### <a name="include"></a>options.include:

| Option             | Type             | Required | Description                                    |
| ------------------ | ---------------- | -------- | ---------------------------------------------- |
| paths              | `array`          | required | One or more paths to scan for files to upload. |
| ignoreFile         | `string`         | optional | See above.                                     |
| ignore             | `string`/`array` | optional | See above.                                     |
| ext                | `array`          | optional | See above.                                     |
| urlPrefix          | `string`         | optional | See above.                                     |
| urlSuffix          | `string`         | optional | See above.                                     |
| stripPrefix        | `array`          | optional | See above.                                     |
| stripCommonPrefix  | `boolean`        | optional | See above.                                     |
| sourceMapReference | `boolean`        | optional | See above.                                     |
| rewrite            | `boolean`        | optional | See above.                                     |

Example:

```js
const SentryCliPlugin = require("@sentry/webpack-plugin");

const config = {
  plugins: [
    new SentryCliPlugin({
      include: [
        {
          paths: ["./packages"],
          urlPrefix: "~/path/to/packages",
        },
        {
          paths: ["./client"],
          urlPrefix: "~/path/to/client",
        },
      ],
      ignoreFile: ".sentrycliignore",
      ignore: ["node_modules", "webpack.config.js"],
      configFile: "sentry.properties",
    }),
  ],
};
```

#### <a name="deploy"></a>options.deploy:

| Option   | Type     | Required | Description                                                                      |
| -------- | -------- | -------- | -------------------------------------------------------------------------------- |
| env      | `string` | required | Environment value for the release, for example `production` or `staging`.        |
| started  | `number` | optional | UNIX timestamp for deployment start.                                             |
| finished | `number` | optional | UNIX timestamp for deployment finish.                                            |
| time     | `number` | optional | Deployment duration in seconds. Can be used instead of `started` and `finished`. |
| name     | `string` | optional | Human-readable name for this deployment.                                         |
| url      | `string` | optional | URL that points to the deployment.                                               |

You can find more information about these options in our official docs:
https://docs.sentry.io/product/cli/releases/#sentry-cli-sourcemaps.
