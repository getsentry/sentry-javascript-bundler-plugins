import { glob } from "glob";
import { UnpluginOptions } from "unplugin";
import { Logger } from "../sentry/logger";
import { safeFlushTelemetry } from "../sentry/telemetry";
import fs from "fs";
import { Scope } from "@sentry/core";
import { Client } from "@sentry/types";

interface FileDeletionPlugin {
  handleRecoverableError: (error: unknown) => void;
  waitUntilSourcemapFileDependenciesAreFreed: () => Promise<void>;
  sentryScope: Scope;
  sentryClient: Client;
  filesToDeleteAfterUpload: string | string[] | undefined;
  logger: Logger;
}

export function fileDeletionPlugin({
  handleRecoverableError,
  sentryScope,
  sentryClient,
  filesToDeleteAfterUpload,
  waitUntilSourcemapFileDependenciesAreFreed,
  logger,
}: FileDeletionPlugin): UnpluginOptions {
  return {
    name: "sentry-file-deletion-plugin",
    async writeBundle() {
      try {
        if (filesToDeleteAfterUpload !== undefined) {
          const filePathsToDelete = await glob(filesToDeleteAfterUpload, {
            absolute: true,
            nodir: true,
          });

          logger.debug(
            "Waiting for dependencies on generated files to be freed before deleting..."
          );

          await waitUntilSourcemapFileDependenciesAreFreed();

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
        sentryScope.captureException('Error in "sentry-file-deletion-plugin" buildEnd hook');
        await safeFlushTelemetry(sentryClient);
        handleRecoverableError(e);
      }
    },
  };
}
