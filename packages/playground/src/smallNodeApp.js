const Sentry = require("@sentry/node");
const { RewriteFrames } = require("@sentry/integrations");

Sentry.init({
  dsn: "https://8fa8ac58d94740a69f74934665aa0770@o1151230.ingest.sentry.io/6680403",
  debug: true,
  enabled: true,
  sampleRate: 1.0,
  integrations: [new RewriteFrames()],
});

const fibonacci = (n) => {
  if (n === 3) {
    Sentry.captureException(new Error("Test error"));
  }
  if (n <= 1) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
};

console.log("Hi, I'm a small sample node app");

fibonacci(10);
