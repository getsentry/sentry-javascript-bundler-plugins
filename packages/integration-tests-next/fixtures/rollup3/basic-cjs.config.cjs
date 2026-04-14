const { sentryRollupPlugin } = require("@sentry/rollup-plugin");
const { defineConfig } = require("rollup");
const { sentryConfig } = require("../configs/basic.config.js");

module.exports = defineConfig({
  input: "src/basic.js",
  output: {
    file: "out/basic-cjs/basic.js",
  },
  plugins: [sentryRollupPlugin(sentryConfig)],
});
