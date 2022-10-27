import axios from "axios";

const AUTH_TOKEN = process.env["SENTRY_AUTH_TOKEN"] || "";
const SENTRY_TEST_ORG_SLUG = "sentry-sdks";
const SENTRY_TEST_PROJECT = "js-bundler-plugin-e2e-tests";

export async function makeGetReleasesRequest(release: string, fileId?: string) {
  return axios.get(
    `https://sentry.io/api/0/projects/${SENTRY_TEST_ORG_SLUG}/${SENTRY_TEST_PROJECT}/releases/${release}/files/${
      fileId ? `${fileId}/?download=1` : ""
    }`,
    { headers: getSentryApiHeaders() }
  );
}

export async function makeDeleteReleaseRequest(release: string) {
  return axios.delete(
    `https://sentry.io/api/0/projects/${SENTRY_TEST_ORG_SLUG}/${SENTRY_TEST_PROJECT}/releases/${release}/`,
    { headers: getSentryApiHeaders() }
  );
}

function getSentryApiHeaders() {
  return { Authorization: `Bearer ${AUTH_TOKEN}` };
}
