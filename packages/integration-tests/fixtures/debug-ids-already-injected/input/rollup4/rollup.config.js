import { defineConfig } from "rollup";
import { sentryRollupPlugin } from "@sentry/rollup-plugin";
import { join, posix } from "path";
import { existsSync, readdirSync } from "fs";

const __dirname = new URL(".", import.meta.url).pathname;

console.log({
  __dirname,
  input: "./bundle.js",
  existsInput: existsSync(join(__dirname, "bundle.js")),
  existsInputPosix: existsSync(posix.join(__dirname, "bundle.js")),
  existsInputDumb: existsSync(`${__dirname}/bundle.js`),
  outputPath: join(__dirname, "..", "..", "out", "rollup4"),
  // allFilesInDirname: readdirSync(join(__dirname, ".")),
});

export default defineConfig({
  input: { index: "./bundle.js" },
  output: {
    dir: join("..", "..", "out", "rollup4"),
    sourcemap: true,
    sourcemapDebugIds: true,
  },
  plugins: [
    sentryRollupPlugin({
      telemetry: false,
      authToken: "fake-auth",
      org: "fake-org",
      project: "fake-project",
    }),
  ],
});
