import {
  defaultStackParser,
  Hub,
  Integrations,
  makeMain,
  makeNodeTransport,
  NodeClient,
} from "@sentry/node";
import { Span } from "@sentry/tracing";
import { AxiosError } from "axios";
import { BuildContext } from "../types";

export function makeSentryClient(
  dsn: string,
  telemetryEnabled: boolean,
  org?: string
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

    debug: true,
  });

  const hub = new Hub(client);

  hub.configureScope((scope) => {
    if (org) {
      scope.setTag("org", org);
    }
  });

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

export function captureMinimalError(error: unknown | Error | AxiosError, hub: Hub) {
  const isAxiosError = error instanceof AxiosError;
  const sentryError =
    error instanceof Error
      ? {
          name: `${isAxiosError && error.status ? error.status : ""}: ${error.name}`,
          message: error.message,
          stack: error.stack,
        }
      : {};

  hub.captureException(sentryError);
}
