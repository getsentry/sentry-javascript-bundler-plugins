const packageJson = require("./package.json");

module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest"],
  },
  globals: {
    __PACKAGE_VERSION__: packageJson.version,
  },
};
