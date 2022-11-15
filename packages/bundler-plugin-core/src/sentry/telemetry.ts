import {
  defaultStackParser,
  Hub,
  Integrations,
  makeMain,
  makeNodeTransport,
  NodeClient,
  Span,
} from "@sentry/node";
import { InternalOptions, SENTRY_SAAS_URL } from "../options-mapping";
import { BuildContext } from "../types";
import { SentryCLILike } from "./cli";

export function makeSentryClient(
  dsn: string,
  telemetryEnabled: boolean
): { client: NodeClient; hub: Hub } {
  const client = new NodeClient({
    dsn,

    enabled: telemetryEnabled,
    tracesSampleRate: telemetryEnabled ? 1.0 : 0.0,
    sampleRate: telemetryEnabled ? 1.0 : 0.0,

    release: __PACKAGE_VERSION__,
    integrations: [new Integrations.Http({ tracing: true })],
    tracePropagationTargets: ["sentry.io/api"],

    stackParser: defaultStackParser,
    transport: makeNodeTransport,
  });

  const hub = new Hub(client);

  //TODO: This call is problematic because as soon as we set our hub as the current hub
  //      we might interfere with other plugins that use Sentry. However, for now, we'll
  //      leave it in because without it, we can't get distributed traces (which are pretty nice)
  //      Let's keep it until someone complains about interference.
  //      The ideal solution would be a code change in the JS SDK but it's not a straight-forward fix.
  makeMain(hub);

  return { client, hub };
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

export function addPluginOptionTags(options: InternalOptions, hub: Hub) {
  const {
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
}

/**
 * Makes a call to SentryCLI to get the Sentry server URL the CLI uses.
 *
 * We need to check and decide to use telemetry based on the CLI's respone to this call
 * because only at this time we checked a possibly existing .sentryclirc file. This file
 * could point to another URL than the default URL.
 */
export async function turnOffTelemetryForSelfHostedSentry(cli: SentryCLILike, hub: Hub) {
  const cliInfo = await cli.execute(["info"], false);

  const url = cliInfo
    ?.split(/(\r\n|\n|\r)/)[0]
    ?.replace(/^Sentry Server: /, "")
    ?.trim();

  if (url !== SENTRY_SAAS_URL) {
    const client = hub.getClient();
    if (client) {
      client.getOptions().enabled = false;
      client.getOptions().tracesSampleRate = 0;
      client.getOptions().sampleRate = 0;
    }
  }
}
