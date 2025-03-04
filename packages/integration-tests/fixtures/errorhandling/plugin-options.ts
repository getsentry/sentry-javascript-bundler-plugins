export default {
  url: `http://localhost:${process.env["FAKE_SENTRY_PORT"] || 3000}`,
  authToken: "fake-auth",
  org: "fake-org",
  project: "fake-project",
  release: {
    name: "1.0.0",
  },
  debug: true,
};
