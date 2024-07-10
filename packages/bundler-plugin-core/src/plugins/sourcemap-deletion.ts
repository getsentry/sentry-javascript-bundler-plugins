import { Hub, NodeClient } from "@sentry/node";
import { glob } from "glob";
import { UnpluginOptions } from "unplugin";
import { Logger } from "../sentry/logger";
import { safeFlushTelemetry } from "../sentry/telemetry";
import fs from "fs";

interface FileDeletionPlugin {
  handleRecoverableError: (error: unknown) => void;
  dependenciesAreFreedPromise: Promise<void>;
  sentryHub: Hub;
  sentryClient: NodeClient;
  filesToDeleteAfterUpload: string | string[] | undefined;
  logger: Logger;
}

export function fileDeletionPlugin({
  handleRecoverableError,
  sentryHub,
  sentryClient,
  filesToDeleteAfterUpload,
  dependenciesAreFreedPromise,
  logger,
}: FileDeletionPlugin): UnpluginOptions {
  const writeBundle = async () => {
    try {
      if (filesToDeleteAfterUpload !== undefined) {
        const filePathsToDelete = await glob(filesToDeleteAfterUpload, {
          absolute: true,
          nodir: true,
        });

        logger.debug("Waiting for dependencies on generated files to be freed before deleting...");

        await dependenciesAreFreedPromise;

        filePathsToDelete.forEach((filePathToDelete) => {
          logger.debug(`Deleting asset after upload: ${filePathToDelete}`);
        });

        await Promise.all(
          filePathsToDelete.map((filePathToDelete) =>
            fs.promises.rm(filePathToDelete, { force: true }).catch((e) => {
              // This is allowed to fail - we just don't do anything
              logger.debug(
                `An error occurred while attempting to delete asset: ${filePathToDelete}`,
                e
              );
            })
          )
        );
      }
    } catch (e) {
      sentryHub.captureException('Error in "sentry-file-deletion-plugin" buildEnd hook');
      await safeFlushTelemetry(sentryClient);
      handleRecoverableError(e);
    }
  };
  return {
    name: "sentry-file-deletion-plugin",
    vite: {
      writeBundle: {
        sequential: true,
        order: "post",
        handler: writeBundle,
      },
    },
    writeBundle,
  };
}
