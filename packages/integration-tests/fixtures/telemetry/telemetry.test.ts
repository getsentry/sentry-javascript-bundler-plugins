/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable jest/no-standalone-expect */
/* eslint-disable jest/expect-expect */
import path from "path";
import * as rollup from "rollup";
import { sentryRollupPlugin } from "@sentry/rollup-plugin";

function getGlobalWithInterceptor(): typeof global & {
  __SENTRY_INTERCEPT_TRANSPORT__?: unknown[];
} {
  return global;
}

test("rollup bundle telemetry", async () => {
  const gbl = getGlobalWithInterceptor();
  gbl.__SENTRY_INTERCEPT_TRANSPORT__ = [];

  await rollup
    .rollup({
      input: { bundle1: path.resolve(__dirname, "input", "bundle1.js") },
      plugins: [
        sentryRollupPlugin({
          release: {
            inject: false,
          },
          telemetry: true,
        }),
      ],
    })
    .then((bundle) =>
      bundle.write({
        sourcemap: true,
        dir: path.join(path.resolve(__dirname, "out"), "rollup"),
        format: "cjs",
        exports: "named",
      })
    );

  // Ensure the session gets closed
  process.emit("beforeExit", 0);

  expect(gbl.__SENTRY_INTERCEPT_TRANSPORT__).toEqual([
    // Fist we should have a session start
    expect.arrayContaining([
      [
        [
          { type: "session" },
          expect.objectContaining({
            sid: expect.any(String),
            init: true,
            started: expect.any(String),
            timestamp: expect.any(String),
            status: "ok",
            errors: 0,
          }),
        ],
      ],
    ]),
    // Then we should get a transaction for execution
    [
      {
        event_id: expect.any(String),
        sent_at: expect.any(String),
        sdk: { name: "sentry.javascript.node", version: expect.any(String) },
        trace: expect.objectContaining({
          environment: "production",
          release: expect.any(String),
          sample_rate: "1",
          transaction: "Sentry Bundler Plugin execution",
          sampled: "true",
        }),
      },
      [
        [
          { type: "transaction" },
          expect.objectContaining({
            contexts: {
              trace: {
                span_id: expect.any(String),
                trace_id: expect.any(String),
                data: {
                  "sentry.origin": "manual",
                  "sentry.source": "custom",
                  "sentry.sample_rate": 1,
                },
                origin: "manual",
              },
              runtime: { name: "node", version: expect.any(String) },
            },
            spans: [],
            start_timestamp: expect.any(Number),
            timestamp: expect.any(Number),
            transaction: "Sentry Bundler Plugin execution",
            type: "transaction",
            transaction_info: { source: "custom" },
            platform: "node",
            event_id: expect.any(String),
            environment: "production",
            release: expect.any(String),
            tags: expect.objectContaining({
              "upload-legacy-sourcemaps": false,
              "module-metadata": false,
              "inject-build-information": false,
              "set-commits": "undefined",
              "finalize-release": true,
              "deploy-options": false,
              "custom-error-handler": false,
              "sourcemaps-assets": false,
              "delete-after-upload": false,
              "sourcemaps-disabled": false,
              "react-annotate": false,
              "meta-framework": "none",
              "application-key-set": false,
              bundler: "rollup",
            }),
            sdk: expect.objectContaining({
              name: "sentry.javascript.node",
              version: expect.any(String),
              packages: [{ name: "npm:@sentry/node", version: expect.any(String) }],
            }),
          }),
        ],
      ],
    ],
    // Then we should get a session exit
    [
      {
        sent_at: expect.any(String),
        sdk: { name: "sentry.javascript.node", version: expect.any(String) },
      },
      [
        [
          { type: "session" },
          {
            sid: expect.any(String),
            init: false,
            started: expect.any(String),
            timestamp: expect.any(String),
            status: "exited",
            errors: 0,
            duration: expect.any(Number),
            attrs: { release: expect.any(String), environment: "production" },
          },
        ],
      ],
    ],
  ]);
});
