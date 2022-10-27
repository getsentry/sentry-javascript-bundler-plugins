import axios from "axios";

const AUTH_TOKEN = process.env["SENTRY_AUTH_TOKEN"] || "";
const SENTRY_TEST_ORG_SLUG = "sentry-sdks";
const SENTRY_TEST_PROJECT = "js-bundler-plugin-e2e-tests";

/**
 * Sends a request to the Sentry API to GET all release files of a given release name
 */
export async function getReleaseFilesFromSentry(release: string) {
  return axios.get(
    `https://sentry.io/api/0/projects/${SENTRY_TEST_ORG_SLUG}/${SENTRY_TEST_PROJECT}/releases/${release}/files/`,
    { headers: getSentryApiHeaders() }
  );
}

/**
 * Sends a request to the Sentry API to GET a specific release file of a given release name and fileId
 */
export async function getReleaseFileFromSentry(release: string, fileId: string) {
  return axios.get(
    `https://sentry.io/api/0/projects/${SENTRY_TEST_ORG_SLUG}/${SENTRY_TEST_PROJECT}/releases/${release}/files/${fileId}/?download=1`,
    { headers: getSentryApiHeaders() }
  );
}

/**
 * Sends a request to the Sentry API to DELETE a specific release for a given release name
 */
export async function deleteReleaseFromSentry(release: string) {
  return axios.delete(
    `https://sentry.io/api/0/projects/${SENTRY_TEST_ORG_SLUG}/${SENTRY_TEST_PROJECT}/releases/${release}/`,
    { headers: getSentryApiHeaders() }
  );
}

function getSentryApiHeaders() {
  return { Authorization: `Bearer ${AUTH_TOKEN}` };
}
