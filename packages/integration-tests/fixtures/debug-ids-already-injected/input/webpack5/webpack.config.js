import { sentryWebpackPlugin } from "@sentry/webpack-plugin";
import { join } from "path";

const __dirname = new URL(".", import.meta.url).pathname;

export default {
  devtool: "source-map-debugids",
  cache: false,
  entry: { index: join(__dirname, "..", "bundle.js") },
  output: {
    path: join(__dirname, "..", "..", "out", "webpack5"),
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
