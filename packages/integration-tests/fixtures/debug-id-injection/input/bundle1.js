// eslint-disable-next-line no-console
console.log(JSON.stringify(global._sentryDebugIds));

// Just so the two bundles generate different hashes:
global.iAmBundle1 = 1;
