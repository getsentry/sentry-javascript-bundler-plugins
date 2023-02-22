const jestPackageJson = require("jest/package.json");

/** @type {import('eslint').ESLint.Options} */
module.exports = {
  root: true,
  extends: ["@sentry-internal/eslint-config/jest", "@sentry-internal/eslint-config/base"],
  ignorePatterns: [
    ".eslintrc.js",
    "dist",
    "jest.config.js",
    "rollup.config.js",
    "test/fixtures/**/*",
  ],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./src/tsconfig.json", "./test/tsconfig.json"],
  },
  globals: {
    __PACKAGE_VERSION__: "readonly",
  },
  env: {
    node: true,
  },
  settings: {
    jest: {
      version: jestPackageJson.version,
    },
  },
};
