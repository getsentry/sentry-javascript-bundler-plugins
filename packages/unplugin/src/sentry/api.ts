import axios from "axios";

// We need to ignore the import because the package.json is not part of the TS project as configured in tsconfig.json
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { version as unpluginVersion } from "../../package.json";

const API_PATH = "/api/0";

// eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
const USER_AGENT = `sentry-unplugin/${unpluginVersion}`;
const sentryApiAxiosInstance = axios.create();
sentryApiAxiosInstance.interceptors.request.use((config) => {
  return {
    ...config,
    headers: {
      ...config.headers,
      "User-Agent": USER_AGENT,
    },
  };
});

export async function createRelease({
  release,
  project,
  org,
  authToken,
  sentryUrl,
}: {
  release: string;
  project: string;
  org: string;
  authToken: string;
  sentryUrl: string;
}): Promise<void> {
  const requestUrl = `${sentryUrl}${API_PATH}/organizations/${org}/releases/`;

  const releasePayload = {
    version: release,
    projects: [project], // we currently only support creating releases for a single project
    dateStarted: new Date(),
    dateReleased: new Date(), //TODO: figure out if these dates are set correctly
  };

  try {
    await sentryApiAxiosInstance.post(requestUrl, releasePayload, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
  } catch (e) {
    // TODO: Maybe do some more sopthisticated error handling here
    throw new Error("Something went wrong while creating a release");
  }
}

export async function deleteAllReleaseArtifacts({
  org,
  release,
  sentryUrl,
  authToken,
  project,
}: {
  org: string;
  release: string;
  sentryUrl: string;
  authToken: string;
  project: string;
}): Promise<void> {
  const requestUrl = `${sentryUrl}${API_PATH}/projects/${org}/${project}/files/source-maps/?name=${release}`;

  try {
    await sentryApiAxiosInstance.delete(requestUrl, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
  } catch (e) {
    // TODO: Maybe do some more sopthisticated error handling here
    throw new Error("Something went wrong while cleaning previous release artifacts");
  }
}

export async function updateRelease({
  release,
  org,
  authToken,
  sentryUrl,
  project,
}: {
  release: string;
  org: string;
  authToken: string;
  sentryUrl: string;
  project: string;
}): Promise<void> {
  const requestUrl = `${sentryUrl}${API_PATH}/projects/${org}/${project}/releases/${release}/`;

  const releasePayload = {
    dateReleased: new Date().toISOString(),
  };

  try {
    await sentryApiAxiosInstance.put(requestUrl, releasePayload, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
  } catch (e) {
    // TODO: Maybe do some more sopthisticated error handling here
    throw new Error("Something went wrong while creating a release");
  }
}
