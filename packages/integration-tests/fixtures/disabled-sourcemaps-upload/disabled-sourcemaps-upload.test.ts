import { sentryRollupPlugin } from "@sentry/rollup-plugin";

const debugIdUploadPluginName = "sentry-rollup-debug-id-upload-plugin";

test("should not call upload plugin when sourcemaps are disabled", () => {
  const plugins = sentryRollupPlugin({
    telemetry: false,
    sourcemaps: {
      disable: true,
    },
  }) as Array<{ name: string }>;

  const debugIdUploadPlugin = plugins.find((plugin) => plugin.name === debugIdUploadPluginName);

  expect(debugIdUploadPlugin).toBeUndefined();
});

test("should call upload plugin when sourcemaps are enabled", () => {
  const plugins = sentryRollupPlugin({
    telemetry: false,
  }) as Array<{ name: string }>;

  const debugIdUploadPlugin = plugins.find((plugin) => plugin.name === debugIdUploadPluginName);

  expect(debugIdUploadPlugin).toBeDefined();
});
