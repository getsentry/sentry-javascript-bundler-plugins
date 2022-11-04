import { Hub } from "@sentry/node";
import axios from "axios";
import { InternalOptions } from "../options-mapping";
import { captureMinimalError } from "./telemetry";

const API_PATH = "api/0";
const USER_AGENT = `sentry-bundler-plugin/${__PACKAGE_VERSION__}`;

const sentryApiAxiosInstance = ({
  authToken,
  customHeader,
}: Required<Pick<InternalOptions, "authToken">> & Pick<InternalOptions, "customHeader">) =>
  axios.create({
    headers: { ...customHeader, "User-Agent": USER_AGENT, Authorization: `Bearer ${authToken}` },
  });

export async function createRelease({
  org,
  project,
  release,
  authToken,
  sentryUrl,
  sentryHub,
  customHeader,
}: {
  release: string;
  project: string;
  org: string;
  authToken: string;
  sentryUrl: string;
  sentryHub: Hub;
  customHeader: Record<string, string>;
}): Promise<void> {
  const requestUrl = `${sentryUrl}${API_PATH}/organizations/${org}/releases/`;

  const releasePayload = {
    version: release,
    projects: [project], // we currently only support creating releases for a single project
    dateStarted: new Date(),
    dateReleased: new Date(), //TODO: figure out if these dates are set correctly
  };

  try {
    await sentryApiAxiosInstance({ authToken, customHeader }).post(requestUrl, releasePayload, {
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
  customHeader,
}: {
  org: string;
  release: string;
  sentryUrl: string;
  authToken: string;
  project: string;
  sentryHub: Hub;
  customHeader: Record<string, string>;
}): Promise<void> {
  const requestUrl = `${sentryUrl}${API_PATH}/projects/${org}/${project}/files/source-maps/?name=${release}`;

  try {
    await sentryApiAxiosInstance({ authToken, customHeader }).delete(requestUrl, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
  } catch (e) {
    captureMinimalError(e, sentryHub);
    throw e;
  }
}
