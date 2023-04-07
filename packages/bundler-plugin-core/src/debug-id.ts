import * as fs from "fs";
import MagicString from "magic-string";
import * as path from "path";
import * as util from "util";
import { Logger } from "./sentry/logger";
import { stringToUUID } from "./utils";

// TODO: Find a more elaborate process to generate this. (Maybe with type checking and built-in minification)
const DEBUG_ID_INJECTOR_SNIPPET =
  ';!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},n=(new Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="__SENTRY_DEBUG_ID__",e._sentryDebugIdIdentifier="sentry-dbid-__SENTRY_DEBUG_ID__")}catch(e){}}();';

export function injectDebugIdSnippetIntoChunk(code: string, filename?: string) {
  const debugId = stringToUUID(code); // generate a deterministic debug ID
  const ms = new MagicString(code, { filename });

  const codeToInject = DEBUG_ID_INJECTOR_SNIPPET.replace(/__SENTRY_DEBUG_ID__/g, debugId);

  // We need to be careful not to inject the snippet before any `"use strict";`s.
  // As an additional complication `"use strict";`s may come after any number of comments.
  const commentUseStrictRegex =
    /^(?:\s*|\/\*(.|\r|\n)*?\*\/|\/\/.*?[\n\r])*(?:"use strict";|'use strict';)?/;

  if (code.match(commentUseStrictRegex)?.[0]) {
    // Add injected code after any comments or "use strict" at the beginning of the bundle.
    ms.replace(commentUseStrictRegex, (match) => `${match}${codeToInject}`);
  } else {
    // ms.replace() doesn't work when there is an empty string match (which happens if
    // there is neither, a comment, nor a "use strict" at the top of the chunk) so we
    // need this special case here.
    ms.prepend(codeToInject);
  }

  return {
    code: ms.toString(),
    map: ms.generateMap(),
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
    bundleContent = await util.promisify(fs.readFile)(bundleFilePath, "utf8");
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
  const writeSourceFilePromise = util.promisify(fs.writeFile)(
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
