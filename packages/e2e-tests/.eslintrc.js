const jestPackageJson = require("jest/package.json");

/** @type {import('eslint').ESLint.Options} */
module.exports = {
  root: true,
  extends: ["@sentry-internal/eslint-config/jest", "@sentry-internal/eslint-config/base"],
  ignorePatterns: [
    ".eslintrc.js",
    "scenarios/*/out",
    "scenarios/*/ref",
    "scenarios/*/input",
    "jest.config.js",
  ],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  env: {
    node: true,
  },
  settings: {
    jest: {
      version: jestPackageJson.version,
    },
  },
  rules: {
    "no-console": "off",
  },
};
