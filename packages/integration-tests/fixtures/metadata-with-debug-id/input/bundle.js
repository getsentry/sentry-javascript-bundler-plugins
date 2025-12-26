// Output both debug IDs and metadata to verify both features work together
// eslint-disable-next-line no-console
console.log(
  JSON.stringify({
    debugIds: global._sentryDebugIds,
    metadata: global._sentryModuleMetadata,
  })
);
