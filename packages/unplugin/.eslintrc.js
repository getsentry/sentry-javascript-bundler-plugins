const jestPackageJson = require("jest/package.json");

/** @type {import('eslint').ESLint.Options} */
module.exports = {
  root: true,
  extends: ["local/jest", "local/base"],
  ignorePatterns: [".eslintrc.js", "dist", "jest.config.js", "rollup.config.js"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./src/tsconfig.json", "./test/tsconfig.json"],
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
