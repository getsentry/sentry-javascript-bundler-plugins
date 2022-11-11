import {
  defaultStackParser,
  Hub,
  Integrations,
  makeMain,
  makeNodeTransport,
  NodeClient,
} from "@sentry/node";
import { Span } from "@sentry/tracing";
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

  if (typeof error === "object") {
    const e = error as { name?: string; message?: string; stack?: string };
    sentryError = {
      name: e.name,
      message: e.message,
      stack: e.stack,
    };
  } else if (typeof error === "string") {
    sentryError = {
      name: "Error",
      message: error,
    };
  }

  hub.captureException(sentryError);
}
