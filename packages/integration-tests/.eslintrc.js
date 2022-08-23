const jestPackageJson = require("jest/package.json");

/** @type {import('eslint').ESLint.Options} */
module.exports = {
  root: true,
  extends: ["local/jest", "local/base"],
  ignorePatterns: [".eslintrc.js", "fixtures/*/out", "jest.config.js"],
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
};
