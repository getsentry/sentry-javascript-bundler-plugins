/** @type {import('eslint').ESLint.Options} */
module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier",
  ],
  rules: {
    "no-console": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
    ],
    "no-undef": "error", // https://github.com/typescript-eslint/typescript-eslint/issues/4580#issuecomment-1047144015
    // Although for most codebases inferencing the return type is fine, we explicitly ask to annotate
    // all functions with a return type. This is so that intent is as clear as possible as well as to
    // avoid accidental breaking changes.
    "@typescript-eslint/explicit-function-return-type": ["error", { allowExpressions: true }],
  },
};
