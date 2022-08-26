import axios from "axios";

import FormData from "form-data";

// We need to ignore the import because the package.json is not part of the TS project as configured in tsconfig.json
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { version as unpluginVersion } from "../../package.json";

const API_PATH = "/api/0";

// eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
const USER_AGENT = `sentry-unplugin/${unpluginVersion}`;
const sentryApiAxiosInstance = (props: {
  authToken: string;
  customHeaders?: Record<string, string>;
}) =>
  axios.create({
    headers: {
      ...props.customHeaders,
      "User-Agent": USER_AGENT,
      Authorization: `Bearer ${props.authToken}`,
    },
  });

export async function createRelease({
  org,
  project,
  release,
  authToken,
  sentryUrl,
  customHeaders,
}: {
  release: string;
  project: string;
  org: string;
  authToken: string;
  sentryUrl: string;
  customHeaders?: Record<string, string>;
}): Promise<void> {
  const requestUrl = `${sentryUrl}${API_PATH}/organizations/${org}/releases/`;

  const releasePayload = {
    version: release,
    projects: [project], // we currently only support creating releases for a single project
    dateStarted: new Date(),
    dateReleased: new Date(), //TODO: figure out if these dates are set correctly
  };

  try {
    await sentryApiAxiosInstance({ authToken, customHeaders }).post(requestUrl, releasePayload);
  } catch (e) {
    // TODO: Maybe do some more sopthisticated error handling here
    throw new Error("Something went wrong while creating a release");
  }
}

export async function deleteAllReleaseArtifacts({
  org,
  project,
  release,
  authToken,
  sentryUrl,
  customHeaders,
}: {
  org: string;
  release: string;
  sentryUrl: string;
  authToken: string;
  project: string;
  customHeaders?: Record<string, string>;
}): Promise<void> {
  const requestUrl = `${sentryUrl}${API_PATH}/projects/${org}/${project}/files/source-maps/?name=${release}`;

  try {
    await sentryApiAxiosInstance({ authToken, customHeaders }).delete(requestUrl, {
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
  customHeaders,
}: {
  release: string;
  org: string;
  authToken: string;
  sentryUrl: string;
  project: string;
  customHeaders?: Record<string, string>;
}): Promise<void> {
  const requestUrl = `${sentryUrl}${API_PATH}/projects/${org}/${project}/releases/${release}/`;

  const releasePayload = {
    dateReleased: new Date().toISOString(),
  };

  try {
    await sentryApiAxiosInstance({ authToken, customHeaders }).put(requestUrl, releasePayload, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
  } catch (e) {
    // TODO: Maybe do some more sopthisticated error handling here
    throw new Error("Something went wrong while creating a release");
  }
}

export async function uploadReleaseFile({
  org,
  project,
  release,
  sentryUrl,
  filename,
  fileContent,
  authToken,
  customHeaders,
}: {
  org: string;
  release: string;
  sentryUrl: string;
  project: string;
  filename: string;
  fileContent: string;
  authToken: string;
  customHeaders?: Record<string, string>;
}) {
  const requestUrl = `${sentryUrl}${API_PATH}/projects/${org}/${project}/releases/${release}/files/`;

  const form = new FormData();
  form.append("name", filename);
  form.append("file", Buffer.from(fileContent, "utf-8"), { filename });

  try {
    await sentryApiAxiosInstance({ authToken, customHeaders }).post(requestUrl, form, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (e) {
    // TODO: Maybe do some more sopthisticated error handling here
    throw new Error(`Something went wrong while uploading file ${filename}`);
  }
}
