module.exports = {
  testEnvironment: "node",
  transformIgnorePatterns: [
    "/node_modules/(?!(uuid)/)", // transpile uuid module to fix test failure
    "\\.pnp\\.[^\\/]+$",
  ],
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest"],
  },
};
