import fs from "fs";
import { glob } from "glob";
import os from "os";
import path from "path";
import * as util from "util";
import { UnpluginOptions } from "unplugin";
import { Logger } from "../sentry/logger";
import { promisify } from "util";
import { Hub, NodeClient } from "@sentry/node";
import SentryCli from "@sentry/cli";

interface DebugIdUploadPluginOptions {
  logger: Logger;
  assets: string | string[];
  ignore?: string | string[];
  releaseName?: string;
  dist?: string;
  handleRecoverableError: (error: unknown) => void;
  sentryHub: Hub;
  sentryClient: NodeClient;
  sentryCliOptions: {
    url: string;
    authToken: string;
    org: string;
    project: string;
    vcsRemote: string;
    silent: boolean;
    headers?: Record<string, string>;
  };
}

export function debugIdUploadPlugin({
  assets,
  ignore,
  logger,
  releaseName,
  dist,
  handleRecoverableError,
  sentryHub,
  sentryClient,
  sentryCliOptions,
}: DebugIdUploadPluginOptions): UnpluginOptions {
  return {
    name: "sentry-debug-id-upload-plugin",
    async writeBundle() {
      let folderToCleanUp: string | undefined;

      const cliInstance = new SentryCli(null, sentryCliOptions);

      try {
        const tmpUploadFolder = await fs.promises.mkdtemp(
          path.join(os.tmpdir(), "sentry-bundler-plugin-upload-")
        );

        folderToCleanUp = tmpUploadFolder;

        const debugIdChunkFilePaths = (
          await glob(assets, {
            absolute: true,
            nodir: true,
            ignore: ignore,
          })
        ).filter(
          (debugIdChunkFilePath) =>
            debugIdChunkFilePath.endsWith(".js") ||
            debugIdChunkFilePath.endsWith(".mjs") ||
            debugIdChunkFilePath.endsWith(".cjs")
        );

        await Promise.all(
          debugIdChunkFilePaths.map(async (chunkFilePath, chunkIndex): Promise<void> => {
            await prepareBundleForDebugIdUpload(
              chunkFilePath,
              tmpUploadFolder,
              String(chunkIndex),
              logger
            );
          })
        );

        await cliInstance.releases.uploadSourceMaps(releaseName ?? "", {
          include: [
            {
              paths: [tmpUploadFolder],
              rewrite: false,
              dist: dist,
            },
          ],
          useArtifactBundle: true,
        });
      } catch (e) {
        sentryHub.captureException('Error in "debugIdUploadPlugin" writeBundle hook');
        await sentryClient.flush();
        handleRecoverableError(e);
      } finally {
        if (folderToCleanUp) {
          void fs.promises.rm(folderToCleanUp, { recursive: true, force: true });
        }
      }
    },
  };
}

export async function prepareBundleForDebugIdUpload(
  bundleFilePath: string,
  uploadFolder: string,
  uniqueUploadName: string,
  logger: Logger
) {
  let bundleContent;
  try {
    bundleContent = await promisify(fs.readFile)(bundleFilePath, "utf8");
  } catch (e) {
    logger.warn(`Could not read bundle to determine debug ID and source map: ${bundleFilePath}`);
    return;
  }

  const debugId = determineDebugIdFromBundleSource(bundleContent);
  if (debugId === undefined) {
    logger.warn(`Could not determine debug ID from bundle: ${bundleFilePath}`);
    return;
  }

  bundleContent += `\n//# debugId=${debugId}`;
  const writeSourceFilePromise = fs.promises.writeFile(
    path.join(uploadFolder, `${uniqueUploadName}.js`),
    bundleContent,
    "utf-8"
  );

  const writeSourceMapFilePromise = determineSourceMapPathFromBundle(
    bundleFilePath,
    bundleContent,
    logger
  ).then(async (sourceMapPath): Promise<void> => {
    if (sourceMapPath) {
      return await prepareSourceMapForDebugIdUpload(
        sourceMapPath,
        path.join(uploadFolder, `${uniqueUploadName}.js.map`),
        debugId,
        logger
      );
    }
  });

  return Promise.all([writeSourceFilePromise, writeSourceMapFilePromise]);
}

/**
 * Looks for a particular string pattern (`sdbid-[debug ID]`) in the bundle
 * source and extracts the bundle's debug ID from it.
 *
 * The string pattern is injected via the debug ID injection snipped.
 */
function determineDebugIdFromBundleSource(code: string): string | undefined {
  const match = code.match(
    /sentry-dbid-([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})/
  );

  if (match) {
    return match[1];
  } else {
    return undefined;
  }
}

/**
 * Applies a set of heuristics to find the source map for a particular bundle.
 *
 * @returns the path to the bundle's source map or `undefined` if none could be found.
 */
async function determineSourceMapPathFromBundle(
  bundlePath: string,
  bundleSource: string,
  logger: Logger
): Promise<string | undefined> {
  // 1. try to find source map at `sourceMappingURL` location
  const sourceMappingUrlMatch = bundleSource.match(/^\/\/# sourceMappingURL=(.*)$/);
  if (sourceMappingUrlMatch) {
    const sourceMappingUrl = path.normalize(sourceMappingUrlMatch[1] as string);
    if (path.isAbsolute(sourceMappingUrl)) {
      return sourceMappingUrl;
    } else {
      return path.join(path.dirname(bundlePath), sourceMappingUrl);
    }
  }

  // 2. try to find source map at path adjacent to chunk source, but with `.map` appended
  try {
    const adjacentSourceMapFilePath = bundlePath + ".map";
    await util.promisify(fs.access)(adjacentSourceMapFilePath);
    return adjacentSourceMapFilePath;
  } catch (e) {
    // noop
  }

  logger.warn(`Could not determine source map path for bundle: ${bundlePath}`);
  return undefined;
}

/**
 * Reads a source map, injects debug ID fields, and writes the source map to the target path.
 */
async function prepareSourceMapForDebugIdUpload(
  sourceMapPath: string,
  targetPath: string,
  debugId: string,
  logger: Logger
): Promise<void> {
  try {
    const sourceMapFileContent = await util.promisify(fs.readFile)(sourceMapPath, {
      encoding: "utf8",
    });

    const map = JSON.parse(sourceMapFileContent) as Record<string, string>;

    // For now we write both fields until we know what will become the standard - if ever.
    map["debug_id"] = debugId;
    map["debugId"] = debugId;

    await util.promisify(fs.writeFile)(targetPath, JSON.stringify(map), {
      encoding: "utf8",
    });
  } catch (e) {
    logger.warn(`Failed to prepare source map for debug ID upload: ${sourceMapPath}`);
  }
}
