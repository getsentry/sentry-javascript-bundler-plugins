import { sentryWebpackPlugin } from "@sentry/webpack-plugin";
import { join, posix } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

console.log({
  __dirname,
  posixInput: posix.join(__dirname, "..", "bundle.js"),
  input: join(__dirname, "..", "bundle.js"),
  outputPath: posix.join(__dirname, "..", "..", "out", "webpack5"),
});

export default {
  devtool: "source-map-debugids",
  cache: false,
  entry: { index: posix.join(__dirname, "..", "bundle.js") },
  output: {
    path: posix.join(__dirname, "..", "..", "out", "webpack5"),
    library: {
      type: "commonjs",
    },
  },
  mode: "production",
  plugins: [
    sentryWebpackPlugin({
      telemetry: false,
      authToken: "fake-auth",
      org: "fake-org",
      project: "fake-project",
    }),
  ],
};
