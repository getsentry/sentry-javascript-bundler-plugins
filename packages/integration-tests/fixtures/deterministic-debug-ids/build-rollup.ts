import { sentryRollupPlugin } from "@sentry/rollup-plugin";
import * as path from "path";
import * as rollup from "rollup";
import pluginOptions from "./plugin-options";

void rollup
  .rollup({
    input: {
      index: path.join(__dirname, "input", "index.js"),
    },
    plugins: [sentryRollupPlugin(pluginOptions)],
  })
  .then((bundle) =>
    bundle.write({
      dir: path.join(__dirname, "out", "rollup"),
      format: "cjs",
      exports: "named",
    })
  );
