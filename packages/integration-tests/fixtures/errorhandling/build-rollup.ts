import { sentryRollupPlugin } from "@sentry/rollup-plugin";
import * as path from "path";
import * as rollup from "rollup";
import pluginOptions from "./plugin-options";

rollup
  .rollup({
    input: {
      index: path.join(__dirname, "input", "bundle.js"),
    },
    plugins: [sentryRollupPlugin(pluginOptions)],
  })
  .then((bundle) =>
    bundle.write({
      dir: path.join(__dirname, "out", "rollup"),
      format: "cjs",
      exports: "named",
    })
  )
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  });
