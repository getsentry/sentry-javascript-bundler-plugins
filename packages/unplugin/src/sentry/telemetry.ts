import {
  defaultStackParser,
  Hub,
  Integrations,
  makeMain,
  makeNodeTransport,
  NodeClient,
  NodeOptions,
} from "@sentry/node";
import { Span } from "@sentry/tracing";
import { version as unpluginVersion } from "../../package.json";

export function makeSentryClient(
  telemetryEnabled: boolean,
  options: NodeOptions,
  org: string
): { client?: NodeClient; hub?: Hub } {
  if (!telemetryEnabled) {
    return { client: undefined, hub: undefined };
  }
  const client = new NodeClient({
    ...options,
    tracesSampleRate: 1.0,
    integrations: [new Integrations.Http({ tracing: true })],
    tracePropagationTargets: ["sentry.io/api"],
    stackParser: defaultStackParser,
    transport: makeNodeTransport,
    release: `${org ? `${org}@` : ""}${unpluginVersion}`,
    debug: true,
  });
  const hub = new Hub(client);

  //TODO: This call is be problematic because as soon as we set our hub as the current hub
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
  sentryHub?: Hub,
  parentSpan?: Span,
  op?: string,
  description?: string
): Span | undefined {
  if (!sentryHub) {
    // If we don't have a hub here, this means that users have disabled telemetry
    // So we don't do anything
    return undefined;
  }

  const actualSpan = parentSpan || sentryHub.getScope()?.getTransaction();
  const span = actualSpan?.startChild({ op, description });
  sentryHub.configureScope((scope) => scope.setSpan(span));

  return span;
}
