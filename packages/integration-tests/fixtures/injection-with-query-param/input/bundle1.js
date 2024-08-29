// eslint-disable-next-line no-console
console.log(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  JSON.stringify({ debugIds: global._sentryDebugIds, release: global.SENTRY_RELEASE.id })
);

// Just so the two bundles generate different hashes:
global.iAmBundle1 = 1;
