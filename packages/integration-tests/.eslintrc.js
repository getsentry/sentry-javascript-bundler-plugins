/** @type {import('eslint').ESLint.Options} */
module.exports = {
  root: true,
  extends: ["@sentry-internal/eslint-config/base"],
  ignorePatterns: [".eslintrc.js", "fixtures/*/out", "fixtures/bundle-size-optimizations/*"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  env: {
    node: true,
  },
  rules: {
    "@typescript-eslint/explicit-function-return-type": "off",
  },
};
