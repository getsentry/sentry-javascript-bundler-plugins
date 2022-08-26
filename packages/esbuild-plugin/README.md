<p align="center">
  <a href="https://sentry.io/?utm_source=github&utm_medium=logo" target="_blank">
    <img src="https://sentry-brand.storage.googleapis.com/sentry-wordmark-dark-280x84.png" alt="Sentry" width="280" height="84">
  </a>
</p>

# Sentry Esbuild Plugin

**DISCLAIMER: This package is work in progress and not production ready. Use with caution. We're happy to receive your feedback!**

A esbuild plugin that provides release management features for Sentry:

- Sourcemap upload
- Release creation
- Automatic release name discovery (based on CI environment - Vercel, AWS, Heroku, CircleCI, or current Git SHA)
- Automatically association of errors with releases (Release injection)

### Configuration

Every plugin takes an options argument with the following properties:

| Option         | Type                                                                                      | Required | Description                                                                                                                                                                                                                                                                         |
| -------------- | ----------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| include        | `string`                                                                                  | required | A path that the plugin should scan recursively for source maps. It will upload all `.map` files and match associated `.js` files.                                                                                                                                                   |
| org            | `string`                                                                                  | optional | The slug of the Sentry organization associated with the app.                                                                                                                                                                                                                        |
| project        | `string`                                                                                  | optional | The slug of the Sentry project associated with the app.                                                                                                                                                                                                                             |
| authToken      | `string`                                                                                  | optional | The authentication token to use for all communication with Sentry. Can be obtained from https://sentry.io/settings/account/api/auth-tokens/. Required scopes: `project:releases` (and `org:read` if `setCommits` option is used).                                                   |
| url            | `string`                                                                                  | optional | The base URL of your Sentry instance. Defaults to https://sentry.io/, which is the correct value for SAAS customers.                                                                                                                                                                |
| release        | `string`                                                                                  | optional | Unique identifier for the release. Defaults to automatically detected values for CI environments like Vercel, AWS, Heroku, CircleCI. If no such CI environment is detected, the plugin uses the git `HEAD`'s commit SHA. (**For `HEAD` option, requires access to the `git` CLI**). |
| entries        | `(string \| RegExp)[] \| RegExp \| string \| function(absoluteFilePath: string): boolean` | optional | Filter for entry points that should be processed. By default, the release will be injected into all entry points.                                                                                                                                                                   |
| ext            | `array`                                                                                   | optional | The file extensions to be considered for the sourcemaps upload. By default the following file extensions are processed: `js`, `map`, `jsbundle`, and `bundle`.                                                                                                                      |
| finalize       | `boolean`                                                                                 | optional | Indicates whether Sentry release record should be automatically finalized (`date_released` timestamp added) after artifact upload. Defaults to `true`                                                                                                                               |
| debug          | `boolean`                                                                                 | optional | Print useful debug information. Defaults to `false`.                                                                                                                                                                                                                                |
| cleanArtifacts | `boolean`                                                                                 | optional | Remove all existing artifacts in the Sentry release before uploading sourcemaps. Defaults to `false`.                                                                                                                                                                               |
| errorHandler   | `function(err: Error): void`                                                              | optional | Function that is called when an error occurs during rlease creation or sourcemaps upload. When this function is provided, thrown errors will not cause the process to abort. If you still want to abort the process you can throw an error in the function.                         |

### More information

- [Sentry Documentation](https://docs.sentry.io/quickstart/)
- [Troubleshooting Sourcemaps](https://docs.sentry.io/platforms/javascript/sourcemaps/troubleshooting_js/)
- [Sentry CLI](https://docs.sentry.io/learn/cli/)
- [Sentry Discord](https://discord.gg/Ww9hbqr)
- [Sentry Stackoverflow](http://stackoverflow.com/questions/tagged/sentry)
