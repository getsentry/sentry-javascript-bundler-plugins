/** @type {import('eslint').ESLint.Options} */
module.exports = {
  overrides: [
    {
      files: ["*.test.js", "*.test.ts", "**/__tests__/**/*.ts", "**/__tests__/**/*.js"],
      plugins: ["jest"],
      extends: ["plugin:jest/recommended", "plugin:jest/style"],
      env: {
        "jest/globals": true,
      },
    },
  ],
};
