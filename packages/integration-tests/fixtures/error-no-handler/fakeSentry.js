import { createServer } from "http";

const port = process.env["FAKE_SENTRY_PORT"] || 3000;

const server = createServer((req, res) => {
  res.statusCode = 503;
  res.end("Error: Santry unreachable");
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Santry running on http://localhost:${port}/`);
});
