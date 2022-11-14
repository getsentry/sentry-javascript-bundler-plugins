import {
  defaultStackParser,
  Hub,
  Integrations,
  makeMain,
  makeNodeTransport,
  NodeClient,
} from "@sentry/node";
import { Span } from "@sentry/tracing";
import { InternalOptions } from "../options-mapping";
import { BuildContext } from "../types";

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
}
