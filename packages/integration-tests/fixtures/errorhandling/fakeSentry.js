// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createServer } = require("http");

const port = process.env["FAKE_SENTRY_PORT"] || 3000;

const server = createServer((req, res) => {
  // eslint-disable-next-line no-console
  console.log("[SANTRY] incoming request", req.url);
  res.statusCode = 503;
  res.end("Error: Santry unreachable");
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[SANTRY] running on http://localhost:${port}/`);
});
