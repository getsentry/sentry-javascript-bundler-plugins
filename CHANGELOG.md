# Changelog

## Unreleased

- "You know what they say ‘Fool me once, strike one, but fool me twice… strike three.’" — Michael Scott

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
