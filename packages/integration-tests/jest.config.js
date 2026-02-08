module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest"],
  },
  transformIgnorePatterns: ["!node_modules/"],
};
