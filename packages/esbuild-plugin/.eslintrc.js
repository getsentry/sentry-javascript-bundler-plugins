const jestPackageJson = require("jest/package.json");

/** @type {import('eslint').ESLint.Options} */
module.exports = {
  root: true,
  extends: ["@sentry-internal/eslint-config/jest", "@sentry-internal/eslint-config/base"],
  ignorePatterns: [".eslintrc.js", "dist", "jest.config.js", "rollup.config.js"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./src/tsconfig.json", "./test/tsconfig.json"],
  },
  env: {
    node: true,
    es6: true,
  },
  settings: {
    jest: {
      version: jestPackageJson.version,
    },
  },
};
