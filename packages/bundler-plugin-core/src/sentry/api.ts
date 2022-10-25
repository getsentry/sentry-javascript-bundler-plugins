import { Hub } from "@sentry/node";
import axios from "axios";
import FormData from "form-data";
import { Options } from "../types";
import { captureMinimalError } from "./telemetry";

const API_PATH = "api/0";
const USER_AGENT = `sentry-bundler-plugin/${__PACKAGE_VERSION__}`;

const sentryApiAxiosInstance = ({
  authToken,
  customHeaders,
}: Required<Pick<Options, "authToken">> & Pick<Options, "customHeaders">) =>
  axios.create({
    headers: { ...customHeaders, "User-Agent": USER_AGENT, Authorization: `Bearer ${authToken}` },
  });

export async function createRelease({
  org,
  project,
  release,
  authToken,
  sentryUrl,
  sentryHub,
  customHeaders,
}: {
  release: string;
  project: string;
  org: string;
  authToken: string;
  sentryUrl: string;
  sentryHub: Hub;
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
    await sentryApiAxiosInstance({ authToken, customHeaders }).post(requestUrl, releasePayload, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
  } catch (e) {
    captureMinimalError(e, sentryHub);
    throw e;
  }
}

export async function deleteAllReleaseArtifacts({
  org,
  project,
  release,
  authToken,
  sentryUrl,
  sentryHub,
  customHeaders,
}: {
  org: string;
  release: string;
  sentryUrl: string;
  authToken: string;
  project: string;
  sentryHub: Hub;
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
    captureMinimalError(e, sentryHub);
    throw e;
  }
}

export async function updateRelease({
  release,
  org,
  authToken,
  sentryUrl,
  project,
  sentryHub,
  customHeaders,
}: {
  release: string;
  org: string;
  authToken: string;
  sentryUrl: string;
  project: string;
  sentryHub: Hub;
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
    captureMinimalError(e, sentryHub);
    throw e;
  }
}

export async function uploadReleaseFile({
  org,
  project,
  release,
  authToken,
  sentryUrl,
  filename,
  fileContent,
  sentryHub,
  customHeaders,
}: {
  org: string;
  release: string;
  sentryUrl: string;
  authToken: string;
  project: string;
  filename: string;
  fileContent: string;
  sentryHub: Hub;
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
    captureMinimalError(e, sentryHub);
    throw e;
  }
}
