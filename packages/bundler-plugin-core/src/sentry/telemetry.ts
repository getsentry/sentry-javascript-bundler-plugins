import SentryCli from "@sentry/cli";
import { defaultStackParser, Hub, makeNodeTransport, NodeClient, Span } from "@sentry/node";
import { InternalOptions, SENTRY_SAAS_URL } from "../options-mapping";
import { BuildContext } from "../types";

const SENTRY_SAAS_HOSTNAME = "sentry.io";

export function makeSentryClient(
  dsn: string,
  allowedToSendTelemetryPromise: Promise<boolean>
): { sentryHub: Hub; sentryClient: NodeClient } {
  const client = new NodeClient({
    dsn,

    tracesSampleRate: 1,
    sampleRate: 1,

    release: __PACKAGE_VERSION__,
    integrations: [],
    tracePropagationTargets: ["sentry.io/api"],

    stackParser: defaultStackParser,

    beforeSend: (event) => {
      delete event.server_name; // Server name might contain PII
      return event;
    },

    beforeSendTransaction: (event) => {
      delete event.server_name; // Server name might contain PII
      return event;
    },

    // We create a transport that stalls sending events until we know that we're allowed to (i.e. when Sentry CLI told
    // us that the upload URL is the Sentry SaaS URL)
    transport: (nodeTransportOptions) => {
      const nodeTransport = makeNodeTransport(nodeTransportOptions);
      return {
        flush: (timeout) => nodeTransport.flush(timeout),
        send: async (request) => {
          const isAllowedToSend = await allowedToSendTelemetryPromise;
          if (isAllowedToSend) {
            return nodeTransport.send(request);
          } else {
            return undefined;
          }
        },
      };
    },
  });

  const hub = new Hub(client);

  return { sentryClient: client, sentryHub: hub };
}

/**
 * Adds a span to the passed parentSpan or to the current transaction that's on the passed hub's scope.
 */
export function addSpanToTransaction(
  ctx: BuildContext,
  op?: string,
  description?: string
): Span | undefined {
  const { hub, parentSpan } = ctx;
  const actualSpan = parentSpan || hub.getScope()?.getTransaction();
  const span = actualSpan?.startChild({ op, description });
  hub.configureScope((scope) => scope.setSpan(span));

  return span;
}

export function captureMinimalError(error: unknown | Error, hub: Hub) {
  let sentryError;

  if (error && typeof error === "object") {
    const e = error as { name?: string; message?: string; stack?: string };
    sentryError = {
      name: e.name,
      message: e.message,
      stack: e.stack,
    };
  } else {
    sentryError = {
      name: "Error",
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      message: `${error}`,
    };
  }

  hub.captureException(sentryError);
}

export function addPluginOptionInformationToHub(
  options: InternalOptions,
  hub: Hub,
  bundler: "rollup" | "webpack" | "vite" | "esbuild"
) {
  const {
    org,
    project,
    cleanArtifacts,
    finalize,
    setCommits,
    injectReleasesMap,
    dryRun,
    errorHandler,
    deploy,
    include,
  } = options;

  hub.setTag("include", include.length > 1 ? "multiple-entries" : "single-entry");

  // Optional release pipeline steps
  if (cleanArtifacts) {
    hub.setTag("clean-artifacts", true);
  }
  if (setCommits) {
    hub.setTag("set-commits", setCommits.auto === true ? "auto" : "manual");
  }
  if (finalize) {
    hub.setTag("finalize-release", true);
  }
  if (deploy) {
    hub.setTag("add-deploy", true);
  }

  // Miscelaneous options
  if (dryRun) {
    hub.setTag("dry-run", true);
  }
  if (injectReleasesMap) {
    hub.setTag("inject-releases-map", true);
  }
  if (errorHandler) {
    hub.setTag("error-handler", "custom");
  }

  hub.setTag("node", process.version);

  hub.setTags({
    organization: org,
    project,
    bundler,
  });

  hub.setUser({ id: org });
}

export async function shouldSendTelemetry(options: InternalOptions): Promise<boolean> {
  const { silent, org, project, authToken, url, vcsRemote, customHeader, dist, telemetry, dryRun } =
    options;

  // `options.telemetry` defaults to true
  if (telemetry === false) {
    return false;
  }

  if (dryRun) {
    return false;
  }

  if (url === SENTRY_SAAS_URL) {
    return true;
  }

  const cli = new SentryCli(options.configFile, {
    url,
    authToken,
    org,
    project,
    vcsRemote,
    dist,
    silent,
    customHeader,
  });

  let cliInfo;
  try {
    // Makes a call to SentryCLI to get the Sentry server URL the CLI uses.
    // We need to check and decide to use telemetry based on the CLI's respone to this call
    // because only at this time we checked a possibly existing .sentryclirc file. This file
    // could point to another URL than the default URL.
    cliInfo = await cli.execute(["info"], false);
  } catch (e) {
    throw new Error(
      'Sentry CLI "info" command failed, make sure you have an auth token configured, and your `url` option is correct.'
    );
  }

  const cliInfoUrl = cliInfo
    .split(/(\r\n|\n|\r)/)[0]
    ?.replace(/^Sentry Server: /, "")
    ?.trim();

  if (cliInfoUrl === undefined) {
    return false;
  }

  return new URL(cliInfoUrl).hostname === SENTRY_SAAS_HOSTNAME;
}
