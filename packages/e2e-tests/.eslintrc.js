/** @type {import('eslint').ESLint.Options} */
module.exports = {
  root: true,
  extends: ["@sentry-internal/eslint-config/jest", "@sentry-internal/eslint-config/base"],
  ignorePatterns: [".eslintrc.js", "scenarios/*/out", "scenarios/*/ref", "scenarios/*/input"],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  env: {
    node: true,
  },
  rules: {
    "no-console": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
  },
};
