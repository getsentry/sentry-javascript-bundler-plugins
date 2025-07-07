import path from "path";

import * as rollup from "rollup";
import { sentryRollupPlugin } from "@sentry/rollup-plugin";

function getGlobalWithDebugIdUploads(): typeof global & {
  __SENTRY_DEBUG_ID_UPLOAD_TEST__?: boolean;
} {
  return global;
}

test("should not call upload plugin when sourcemaps are disabled", async () => {
  const gbl = getGlobalWithDebugIdUploads();
  gbl.__SENTRY_DEBUG_ID_UPLOAD_TEST__ = false;

  await rollup.rollup({
    input: { bundle1: path.resolve(__dirname, "input", "bundle.js") },
    plugins: [
      sentryRollupPlugin({
        telemetry: false,
        sourcemaps: {
          disable: true,
        },
      }),
    ],
  });

  expect(gbl.__SENTRY_DEBUG_ID_UPLOAD_TEST__).toBe(false);
});

test("should call upload plugin when sourcemaps are enabled", async () => {
  const gbl = getGlobalWithDebugIdUploads();
  gbl.__SENTRY_DEBUG_ID_UPLOAD_TEST__ = false;

  await rollup.rollup({
    input: { bundle1: path.resolve(__dirname, "input", "bundle.js") },
    plugins: [
      sentryRollupPlugin({
        telemetry: false,
      }),
    ],
  });

  expect(gbl.__SENTRY_DEBUG_ID_UPLOAD_TEST__).toBe(true);
});
