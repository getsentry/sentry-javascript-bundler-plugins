import fs from "fs";
import { glob } from "glob";
import os from "os";
import path from "path";
import * as util from "util";
import { Logger } from "./sentry/logger";
import { promisify } from "util";
import SentryCli from "@sentry/cli";
import { dynamicSamplingContextToSentryBaggageHeader } from "@sentry/utils";
import { safeFlushTelemetry } from "./sentry/telemetry";
import { stripQueryAndHashFromPath } from "./utils";
import { setMeasurement, spanToTraceHeader, startSpan } from "@sentry/core";
import { getDynamicSamplingContextFromSpan, Scope } from "@sentry/core";
import { Client } from "@sentry/types";
import { HandleRecoverableErrorFn } from "./types";

interface RewriteSourcesHook {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (source: string, map: any): string;
}

interface DebugIdUploadPluginOptions {
  logger: Logger;
  assets?: string | string[];
  ignore?: string | string[];
  releaseName?: string;
  dist?: string;
  rewriteSourcesHook?: RewriteSourcesHook;
  handleRecoverableError: HandleRecoverableErrorFn;
  sentryScope: Scope;
  sentryClient: Client;
  sentryCliOptions: {
    url: string;
    authToken: string;
    org?: string;
    project: string;
    vcsRemote: string;
    silent: boolean;
    headers?: Record<string, string>;
  };
  createDependencyOnSourcemapFiles: () => () => void;
}

export function createDebugIdUploadFunction({
  assets,
  ignore,
  logger,
  releaseName,
  dist,
  handleRecoverableError,
  sentryScope,
  sentryClient,
  sentryCliOptions,
  rewriteSourcesHook,
  createDependencyOnSourcemapFiles,
}: DebugIdUploadPluginOptions) {
  const freeGlobalDependencyOnSourcemapFiles = createDependencyOnSourcemapFiles();

  return async (buildArtifactPaths: string[]) => {
    await startSpan(
      // This is `forceTransaction`ed because this span is used in dashboards in the form of indexed transactions.
      { name: "debug-id-sourcemap-upload", scope: sentryScope, forceTransaction: true },
      async () => {
        let folderToCleanUp: string | undefined;

        // It is possible that this writeBundle hook (which calls this function) is called multiple times in one build (for example when reusing the plugin, or when using build tooling like `@vitejs/plugin-legacy`)
        // Therefore we need to actually register the execution of this hook as dependency on the sourcemap files.
        const freeUploadDependencyOnSourcemapFiles = createDependencyOnSourcemapFiles();

        try {
          const tmpUploadFolder = await startSpan(
            { name: "mkdtemp", scope: sentryScope },
            async () => {
              return await fs.promises.mkdtemp(
                path.join(os.tmpdir(), "sentry-bundler-plugin-upload-")
              );
            }
          );

          folderToCleanUp = tmpUploadFolder;

          let globAssets: string | string[];
          if (assets) {
            globAssets = assets;
          } else {
            logger.debug(
              "No `sourcemaps.assets` option provided, falling back to uploading detected build artifacts."
            );
            globAssets = buildArtifactPaths;
          }

          const globResult = await startSpan(
            { name: "glob", scope: sentryScope },
            async () => await glob(globAssets, { absolute: true, nodir: true, ignore: ignore })
          );

          const debugIdChunkFilePaths = globResult.filter((debugIdChunkFilePath) => {
            return !!stripQueryAndHashFromPath(debugIdChunkFilePath).match(/\.(js|mjs|cjs)$/);
          });

          // The order of the files output by glob() is not deterministic
          // Ensure order within the files so that {debug-id}-{chunkIndex} coupling is consistent
          debugIdChunkFilePaths.sort();

          if (Array.isArray(assets) && assets.length === 0) {
            logger.debug(
              "Empty `sourcemaps.assets` option provided. Will not upload sourcemaps with debug ID."
            );
          } else if (debugIdChunkFilePaths.length === 0) {
            logger.warn(
              "Didn't find any matching sources for debug ID upload. Please check the `sourcemaps.assets` option."
            );
          } else {
            await startSpan(
              { name: "prepare-bundles", scope: sentryScope },
              async (prepBundlesSpan) => {
                // Preparing the bundles can be a lot of work and doing it all at once has the potential of nuking the heap so
                // instead we do it with a maximum of 16 concurrent workers
                const preparationTasks = debugIdChunkFilePaths.map(
                  (chunkFilePath, chunkIndex) => async () => {
                    await prepareBundleForDebugIdUpload(
                      chunkFilePath,
                      tmpUploadFolder,
                      chunkIndex,
                      logger,
                      rewriteSourcesHook ?? defaultRewriteSourcesHook
                    );
                  }
                );
                const workers: Promise<void>[] = [];
                const worker = async () => {
                  while (preparationTasks.length > 0) {
                    const task = preparationTasks.shift();
                    if (task) {
                      await task();
                    }
                  }
                };
                for (let workerIndex = 0; workerIndex < 16; workerIndex++) {
                  workers.push(worker());
                }

                await Promise.all(workers);

                const files = await fs.promises.readdir(tmpUploadFolder);
                const stats = files.map((file) =>
                  fs.promises.stat(path.join(tmpUploadFolder, file))
                );
                const uploadSize = (await Promise.all(stats)).reduce(
                  (accumulator, { size }) => accumulator + size,
                  0
                );

                setMeasurement("files", files.length, "none", prepBundlesSpan);
                setMeasurement("upload_size", uploadSize, "byte", prepBundlesSpan);

                await startSpan({ name: "upload", scope: sentryScope }, async (uploadSpan) => {
                  const cliInstance = new SentryCli(null, {
                    ...sentryCliOptions,
                    headers: {
                      "sentry-trace": spanToTraceHeader(uploadSpan),
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      baggage: dynamicSamplingContextToSentryBaggageHeader(
                        getDynamicSamplingContextFromSpan(uploadSpan)
                      )!,
                      ...sentryCliOptions.headers,
                    },
                  });

                  await cliInstance.releases.uploadSourceMaps(
                    releaseName ?? "undefined", // unfortunately this needs a value for now but it will not matter since debug IDs overpower releases anyhow
                    {
                      include: [
                        {
                          paths: [tmpUploadFolder],
                          rewrite: false,
                          dist: dist,
                        },
                      ],
                    }
                  );
                });
              }
            );

            logger.info("Successfully uploaded source maps to Sentry");
          }
        } catch (e) {
          sentryScope.captureException('Error in "debugIdUploadPlugin" writeBundle hook');
          handleRecoverableError(e, false);
        } finally {
          if (folderToCleanUp) {
            void startSpan({ name: "cleanup", scope: sentryScope }, async () => {
              if (folderToCleanUp) {
                await fs.promises.rm(folderToCleanUp, { recursive: true, force: true });
              }
            });
          }
          freeGlobalDependencyOnSourcemapFiles();
          freeUploadDependencyOnSourcemapFiles();
          await safeFlushTelemetry(sentryClient);
        }
      }
    );
  };
}

export async function prepareBundleForDebugIdUpload(
  bundleFilePath: string,
  uploadFolder: string,
  chunkIndex: number,
  logger: Logger,
  rewriteSourcesHook: RewriteSourcesHook
) {
  let bundleContent;
  try {
    bundleContent = await promisify(fs.readFile)(bundleFilePath, "utf8");
  } catch (e) {
    logger.error(
      `Could not read bundle to determine debug ID and source map: ${bundleFilePath}`,
      e
    );
    return;
  }

  const debugId = determineDebugIdFromBundleSource(bundleContent);
  if (debugId === undefined) {
    logger.debug(
      `Could not determine debug ID from bundle. This can happen if you did not clean your output folder before installing the Sentry plugin. File will not be source mapped: ${bundleFilePath}`
    );
    return;
  }

  const uniqueUploadName = `${debugId}-${chunkIndex}`;

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
  ).then(async (sourceMapPath) => {
    if (sourceMapPath) {
      await prepareSourceMapForDebugIdUpload(
        sourceMapPath,
        path.join(uploadFolder, `${uniqueUploadName}.js.map`),
        debugId,
        rewriteSourcesHook,
        logger
      );
    }
  });

  await writeSourceFilePromise;
  await writeSourceMapFilePromise;
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
  const sourceMappingUrlMatch = bundleSource.match(/^\s*\/\/# sourceMappingURL=(.*)$/m);
  if (sourceMappingUrlMatch) {
    const sourceMappingUrl = path.normalize(sourceMappingUrlMatch[1] as string);

    let isUrl;
    let isSupportedUrl;
    try {
      const url = new URL(sourceMappingUrl);
      isUrl = true;
      isSupportedUrl = url.protocol === "file:";
    } catch {
      isUrl = false;
      isSupportedUrl = false;
    }

    let absoluteSourceMapPath;
    if (isSupportedUrl) {
      absoluteSourceMapPath = sourceMappingUrl;
    } else if (isUrl) {
      // noop
    } else if (path.isAbsolute(sourceMappingUrl)) {
      absoluteSourceMapPath = sourceMappingUrl;
    } else {
      absoluteSourceMapPath = path.join(path.dirname(bundlePath), sourceMappingUrl);
    }

    if (absoluteSourceMapPath) {
      try {
        // Check if the file actually exists
        await util.promisify(fs.access)(absoluteSourceMapPath);
        return absoluteSourceMapPath;
      } catch (e) {
        // noop
      }
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

  // This is just a debug message because it can be quite spammy for some frameworks
  logger.debug(
    `Could not determine source map path for bundle: ${bundlePath} - Did you turn on source map generation in your bundler?`
  );
  return undefined;
}

/**
 * Reads a source map, injects debug ID fields, and writes the source map to the target path.
 */
async function prepareSourceMapForDebugIdUpload(
  sourceMapPath: string,
  targetPath: string,
  debugId: string,
  rewriteSourcesHook: RewriteSourcesHook,
  logger: Logger
): Promise<void> {
  let sourceMapFileContent: string;
  try {
    sourceMapFileContent = await util.promisify(fs.readFile)(sourceMapPath, {
      encoding: "utf8",
    });
  } catch (e) {
    logger.error(`Failed to read source map for debug ID upload: ${sourceMapPath}`, e);
    return;
  }

  let map: Record<string, unknown>;
  try {
    map = JSON.parse(sourceMapFileContent) as { sources: unknown; [key: string]: unknown };
    // For now we write both fields until we know what will become the standard - if ever.
    map["debug_id"] = debugId;
    map["debugId"] = debugId;
  } catch (e) {
    logger.error(`Failed to parse source map for debug ID upload: ${sourceMapPath}`);
    return;
  }

  if (map["sources"] && Array.isArray(map["sources"])) {
    map["sources"] = map["sources"].map((source: string) => rewriteSourcesHook(source, map));
  }

  try {
    await util.promisify(fs.writeFile)(targetPath, JSON.stringify(map), {
      encoding: "utf8",
    });
  } catch (e) {
    logger.error(`Failed to prepare source map for debug ID upload: ${sourceMapPath}`, e);
    return;
  }
}

const PROTOCOL_REGEX = /^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\//;
function defaultRewriteSourcesHook(source: string): string {
  if (source.match(PROTOCOL_REGEX)) {
    return source.replace(PROTOCOL_REGEX, "");
  } else {
    return path.relative(process.cwd(), path.normalize(source));
  }
}
