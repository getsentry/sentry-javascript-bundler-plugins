const packageJson = require("./package.json");

module.exports = {
  testEnvironment: "node",
  modulePathIgnorePatterns: ["fixtures"],
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest"],
  },
};
