const packageJson = require("./package.json");

module.exports = {
  testEnvironment: "node",
  modulePathIgnorePatterns: ["fixtures"],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          transform: {
            optimizer: {
              globals: {
                vars: {
                  __PACKAGE_VERSION__: packageJson.version,
                },
              },
            },
          },
        },
      },
    ],
  },
};
