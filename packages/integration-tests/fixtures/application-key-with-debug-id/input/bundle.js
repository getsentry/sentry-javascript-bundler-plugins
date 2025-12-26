/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
// Output both debug IDs and metadata to verify applicationKey works with debug ID injection
// eslint-disable-next-line no-console
console.log(
  JSON.stringify({
    debugIds: global._sentryDebugIds,
    metadata: global._sentryModuleMetadata,
  })
);
