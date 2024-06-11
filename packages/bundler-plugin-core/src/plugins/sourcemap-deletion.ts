import { Hub, NodeClient } from "@sentry/node";
import { UnpluginOptions } from "unplugin";
import { safeFlushTelemetry } from "../sentry/telemetry";

interface FileDeletionPlugin {
  handleRecoverableError: (error: unknown) => void;
  deleteFilesUpForDeletion: () => Promise<void>;
  sentryHub: Hub;
  sentryClient: NodeClient;
}

export function fileDeletionPlugin({
  handleRecoverableError,
  sentryHub,
  sentryClient,
  deleteFilesUpForDeletion,
}: FileDeletionPlugin): UnpluginOptions {
  return {
    name: "sentry-file-deletion-plugin",
    async buildEnd() {
      try {
        await deleteFilesUpForDeletion();
      } catch (e) {
        sentryHub.captureException('Error in "sentry-file-deletion-plugin" buildEnd hook');
        await safeFlushTelemetry(sentryClient);
        handleRecoverableError(e);
      }
    },
  };
}
