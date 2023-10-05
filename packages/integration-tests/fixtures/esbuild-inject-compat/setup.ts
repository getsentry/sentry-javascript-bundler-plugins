import { sentryEsbuildPlugin } from "@sentry/esbuild-plugin";
import esbuild from "esbuild019";
import path from "path";

esbuild
  .build({
    bundle: true,
    entryPoints: [path.resolve(__dirname, "./input/index.ts")],
    outdir: path.resolve(__dirname, "./out"),
    inject: [path.resolve(__dirname, "./input/inject.ts")],
    plugins: [
      sentryEsbuildPlugin({
        telemetry: false,
      }),
    ],
    minify: false,
  })
  .catch((e) => {
    throw e;
  });
