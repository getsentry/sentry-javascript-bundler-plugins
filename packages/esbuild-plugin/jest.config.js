module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest"],
  },
  moduleNameMapper: {
    uuid: require.resolve("uuid"), // https://stackoverflow.com/a/73203803
  },
};
