import fs from "fs";
import path from "path";
import * as util from "util";
import { promisify } from "util";
import { SentryBuildPluginManager } from "./build-plugin-manager";
import { Logger } from "./logger";

interface RewriteSourcesHook {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (source: string, map: any): string;
}

interface DebugIdUploadPluginOptions {
  sentryBuildPluginManager: SentryBuildPluginManager;
}

export function createDebugIdUploadFunction({
  sentryBuildPluginManager,
}: DebugIdUploadPluginOptions) {
  return async (buildArtifactPaths: string[]) => {
    await sentryBuildPluginManager.uploadSourcemaps(buildArtifactPaths);
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

  bundleContent = addDebugIdToBundleSource(bundleContent, debugId);
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

const SPEC_LAST_DEBUG_ID_REGEX = /\/\/# debugId=([a-fA-F0-9-]+)(?![\s\S]*\/\/# debugId=)/m;

function hasSpecCompliantDebugId(bundleSource: string): boolean {
  return SPEC_LAST_DEBUG_ID_REGEX.test(bundleSource);
}

function addDebugIdToBundleSource(bundleSource: string, debugId: string): string {
  if (hasSpecCompliantDebugId(bundleSource)) {
    return bundleSource.replace(SPEC_LAST_DEBUG_ID_REGEX, `//# debugId=${debugId}`);
  } else {
    return `${bundleSource}\n//# debugId=${debugId}`;
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
export function defaultRewriteSourcesHook(source: string): string {
  if (source.match(PROTOCOL_REGEX)) {
    return source.replace(PROTOCOL_REGEX, "");
  } else {
    return path.relative(process.cwd(), path.normalize(source));
  }
}
