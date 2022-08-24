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
  // using the legacy endpoint here because the sentry webpack plugin only associates one project
  // with the release. If we ever wanna support multiple projects in the unplugin,
  // take a look at how sentry/cli calls the new endpoint:
  // https://github.com/getsentry/sentry-cli/blob/4fa813549cd249e77ae6ba974d76e606a19f48de/src/api.rs#L769-L773
  const requestUrl = `${sentryUrl}${API_PATH}/projects/${org}/${project}/releases/`;

  const releasePayload = {
    version: release,
    projects: [project],
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
  project?: string;
}): Promise<void> {
  const requestUrl = project
    ? `${sentryUrl}${API_PATH}/projects/${org}/${project}/files/source-maps/?name=${release}` // legacy endpoint if users provide project
    : `${sentryUrl}${API_PATH}/organizations/${org}/files/source-maps/?name=${release}`; // new endpoint

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
