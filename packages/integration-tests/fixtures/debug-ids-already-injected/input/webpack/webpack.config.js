import { sentryWebpackPlugin } from "@sentry/webpack-plugin";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  devtool: "source-map-debugids",
  cache: false,
  entry: { index: join(__dirname, "..", "bundle.js") },
  output: {
    path: join(__dirname, "..", "..", "out", "webpack"),
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
