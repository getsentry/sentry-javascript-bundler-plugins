// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
process.stdout.write((global.SENTRY_RELEASE || {}).id || "");
