/* eslint-disable @typescript-eslint/no-empty-function */

import axios from "axios";
import { AxiosError } from "axios";
import { Options } from "../types";

const API_PATH = "api/0";

type SentryRequestOptions = Pick<Options, "authToken" | "url"> & {
  method: string;
  endpoint: string;
  payload: unknown;
};

/**
 * Generic function to call to make the actual request.
 * Currently takes care of adding headers.
 * Happy to change this to something more sophisticated.
 */
async function makeRequest(requestOptions: SentryRequestOptions) {
  const { authToken, url, endpoint, method, payload } = requestOptions;

  if (!authToken || !url || !endpoint) {
    return Promise.reject();
  }

  const response = await axios({
    method,
    url: `${url}/${API_PATH}/${endpoint}`,
    data: payload,
    headers: { Authorization: `Bearer ${authToken}`, "User-Agent": "sentry-unplugin" },
  }).catch((error: AxiosError) => {
    const msg = `Error: ${error.message}`;
    throw new Error(msg);
  });

  return response;
}

/* Just a wrapper to make POST requests */
async function makePostRequest(requestOptions: Omit<SentryRequestOptions, "method">) {
  return makeRequest({ ...requestOptions, method: "POST" });
}

export async function makeNewReleaseRequest(release: string, options: Options): Promise<string> {
  const releasePayload = {
    version: release,
    projects: [options.project],
    dateStarted: new Date(),
    dateReleased: new Date(), //TODO: figure out if these dates are set correctly
  };

  const orgSlug = options.org || "";
  const projectSlug = options.project || "";

  // using the legacy endpoint here because the sentry webpack plugin only associates one project
  // with the release. If we ever wanna support multiple projects in the unplugin,
  // take a look at how sentry/cli calls the new endpoint:
  // https://github.com/getsentry/sentry-cli/blob/4fa813549cd249e77ae6ba974d76e606a19f48de/src/api.rs#L769-L773
  const response = await makePostRequest({
    authToken: options.authToken,
    url: options.url,
    endpoint: `projects/${orgSlug}/${projectSlug}/releases/`,
    payload: releasePayload,
  });

  return response.status.toString();
}
