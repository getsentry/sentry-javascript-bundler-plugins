<p align="center">
  <a href="https://sentry.io/?utm_source=github&utm_medium=logo" target="_blank">
    <img src="https://sentry-brand.storage.googleapis.com/sentry-wordmark-dark-280x84.png" alt="Sentry" width="280" height="84">
  </a>
</p>

# Contributing

We welcome suggested improvements and bug fixes to the `@sentry/*` family of packages, in the form of pull requests on [`GitHub`](https://github.com/getsentry/sentry-javascript-bundler-plugins). The guide below will help you get started, but if you have further questions, please feel free to reach out on [Discord](https://discord.gg/Ww9hbqr).

## Setting up an Environment

To run the test suite and our code linter, node.js and yarn are required.

[`node` download](https://nodejs.org/download)
[`yarn` download](https://yarnpkg.com/en/docs/install)

`sentry-javascript-bundler-plugins` is a monorepo containing several packages, and we use `nx` to manage them. To get started, install all dependencies and then perform an initial build.

```
$ yarn
$ yarn build
```

With that, the repo is fully set up and you are ready to run all commands.

## Building Packages

Since we are using [`TypeScript`](https://www.typescriptlang.org/), you need to transpile the code to JavaScript to be able to use it. From the top level of the repo, there are three commands available:

- `yarn build`, which runs a one-time build (transpiling and type generation) of every package
- `yarn build:watch`, which runs the command listed above in watch mode, meaning the command is re-executed after every file change

## Adding Tests

**Any nontrivial fixes/features should include tests.** You'll find a `test` folder in each package.

## Running Tests

Running tests works the same way as building - running `yarn test` at the project root will run tests for all packages, and running `yarn test` in a specific package will run tests for that package. There are also commands to run subsets of the tests in each location. Check out the `scripts` entry of the corresponding `package.json` for details.

## Linting

Similar to building and testing, linting can be done in the project root or in individual packages by calling `yarn lint`.

## Considerations Before Sending Your First PR

When contributing to the codebase, please note:

- Non-trivial PRs will not be accepted without tests (see above).
  If you need assistance in writing tests, feel free to reach out to us.
- Please do not bump version numbers yourself.

## PR reviews

For feedback in PRs, we use the [LOGAF scale](https://blog.danlew.net/2020/04/15/the-logaf-scale/) to specify how important a comment is:

- `l`: low - nitpick. You may address this comment, but you don't have to.
- `m`: medium - normal comment. Worth addressing and fixing.
- `h`: high - Very important. We must not merge this PR without addressing this issue.

You only need one approval from a maintainer to be able to merge. For some PRs, asking specific or multiple people for review might be adequate.

Our different types of reviews:

1. **LGTM without any comments.** You can merge immediately.
2. **LGTM with low and medium comments.** The reviewer trusts you to resolve these comments yourself, and you don't need to wait for another approval.
3. **Only comments.** You must address all the comments and need another review until you merge.
4. **Request changes.** Only use if something critical is in the PR that absolutely must be addressed. We usually use `h` comments for that. When someone requests changes, the same person must approve the changes to allow merging. Use this sparingly.

## Publishing a Release

_These steps are only relevant to Sentry employees when preparing and publishing a new SDK release._

1. Determine what version will be released (we use [semver](https://semver.org)).
2. Update [`CHANGELOG.md`](https://github.com/getsentry/sentry-javascript-bundler-plugins/edit/master/CHANGELOG.md) to add an entry for the next release number and a list of changes since the last release. (See details below.)
3. Run the [Prepare Release](https://github.com/getsentry/sentry-javascript-bundler-plugins/actions/workflows/release.yml) workflow.
4. A new issue should appear in https://github.com/getsentry/publish/issues.
5. Ask a member of the [@getsentry/releases team](https://github.com/orgs/getsentry/teams/releases/members) to approve the release.

### Updating the Changelog

1. Create a new branch.
2. Run `git log --format="- %s"` and copy everything since the last release.
3. Create a new section in the changelog, deciding based on the changes whether it should be a minor bump or a patch release.
4. Paste in the logs you copied earlier.
5. Delete any which aren't user-facing changes.
6. Alphabetize the rest.
7. If any of the PRs are from external contributors, include underneath the commits `Work in this release contributed by <list of external contributors' GitHub usernames>. Thank you for your contributions!`. If there's only one external PR, don't forget to remove the final `s`. If there are three or more, use an Oxford comma. (It's in the Sentry styleguide!)
8. Commit, push, and open a PR with the title `meta: Update changelog for <fill in relevant version here>`.
