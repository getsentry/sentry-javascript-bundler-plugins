# Changelog

## Unreleased

- "You know what they say ‘Fool me once, strike one, but fool me twice… strike three.’" — Michael Scott

## 0.4.0

This release contains breaking changes. Please refer to the [migration guide](https://github.com/getsentry/sentry-javascript-bundler-plugins/blob/main/MIGRATION.md) on how to update from version `0.3.x` to `0.4.x`.

- deps(core): Bump unplugin version (#164)
- ref(core): Only inject release into entrypoints per default (#166) (BREAKING)
- ref: Remove `customHeader` option (#167) (BREAKING)
- ref: Turn default exports into named exports (#165) (BREAKING)

Work in this release contributed by @manniL. Thank you for your contribution!

## 0.3.0

Note: This release bumps the [`@sentry/cli`](https://www.npmjs.com/package/@sentry/cli) dependency from version `1.x` to version `2.x`.

- feat(core): Add headers option (#153)

Work in this release contributed by @robertcepa. Thank you for your contribution!

## 0.2.4

- build(core): Update magic-string due to deprecated dependency (#146)
- ref(core): Send project as `dist` in telemetry (#148)

Work in this release contributed by @jperelli. Thank you for your contribution!

## 0.2.3

- fix: Exclude `node_modules` from release injection (#143)

## 0.2.2

- feat(core): Remove `server_name` from telemetry events (#135)
- fix: Add definitions in package.json for ESM resolution (#141)
- fix(core): Finish spans when CLI commands fail (#136)
- ref(core): Decouple breadcrumb usage from logger (#138)
- ref(core): Don't record stack traces for telemetry (#137)

## 0.2.1

- fix(core): Fix telemetry option logic (#128)
- fix(core): Normalize `id` and `releaseInjectionTargets` in `transformInclude` (#132)

## 0.2.0

This release replaces the `entries` option with `releaseInjectionTargets` which is a breaking change from previous versions.
For more information, take a look at the [migration guide](https://github.com/getsentry/sentry-javascript-bundler-plugins/blob/main/MIGRATION.md#replacing-entries-option-with-releaseinjectiontargets).

- feat: Replace `entries` option with `releaseInjectionTargets` (#123)

## 0.1.0

With this release, the Sentry bundler plugins support all features of the standalone Sentry Webpack plugin.
Please note that breaking changes might still be introduced.

- Re-added Sentry CLI to the project (#85).
  The bundler plugins use Sentry CLI to create releases and upload sourcemaps
- Added missing Release creation steps
  - feat(core): Add `setCommits` (#96)
  - feat(core): Add `deploy` command (#97)
- Added validation of plugin options (#104)
- Refined `telemetry` option to only send events to Sentry for projects uploading source maps to Sentry's SaaS instance (#99). For self-hosted Sentry servers, nothing will be sent to Sentry.
- Updated `README.md` files with examples and option descriptions for each bundler plugin (#117)

Link to [Full Changelog](https://github.com/getsentry/sentry-javascript-bundler-plugins/compare/0.0.1-alpha.0...main)

## 0.0.1-alpha.0

This release marks the first release of the Sentry bundler blugins. This is still a heavy work in progress and a lot of things are still missing and subject to change

- Initial release
