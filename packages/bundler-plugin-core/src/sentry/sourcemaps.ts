import path from "path";
import fs, { Stats } from "fs";
import glob from "glob";
import { InternalIncludeEntry } from "../options-mapping";

import ignore, { Ignore } from "ignore";

export type FileRecord = {
  name: string;
  content: string;
};

type FileNameRecord = {
  absolutePath: string;
  // Contains relative paths without leading `.` (e.g. "foo/bar.js" or "asdf\\a\\b.js.map")
  relativePath: string;
  // Holds the path of the file relative to the CWD (used for ignore matching)
  relativeCwdPath: string;
};

export function getFiles(includePath: string, includeEntry: InternalIncludeEntry): FileRecord[] {
  // Start with getting all (unfiltered) files for the given includePath.
  const files = collectAllFiles(includePath);
  if (!files.length) {
    return [];
  }

  const ignore = getIgnoreRules(includeEntry);
  const filteredFiles = files
    .filter(({ relativeCwdPath }) => !ignore.ignores(relativeCwdPath))
    .filter(({ absolutePath }) => includeEntry.ext.includes(path.extname(absolutePath)));

  // TODO do sourcemap rewriting?
  // TODO do sourcefile rewriting? (adding source map reference to bottom - search for "guess_sourcemap_reference")
  return filteredFiles.map(({ absolutePath, relativePath }) => {
    const content = fs.readFileSync(absolutePath, { encoding: "utf-8" });
    return {
      name:
        (includeEntry.urlPrefix ?? "~/") +
        convertWindowsPathToPosix(relativePath) +
        (includeEntry.urlSuffix ?? ""),
      content,
    };
  });
}

/**
 * Collects all (unfiltered) files from @param includePath
 * @param includePath
 * @returns an array of files
 */
function collectAllFiles(includePath: string): FileNameRecord[] {
  let fileStat: Stats;

  const absolutePath = path.isAbsolute(includePath)
    ? includePath
    : path.resolve(process.cwd(), includePath);
  try {
    fileStat = fs.statSync(absolutePath);
  } catch (e) {
    return [];
  }

  if (fileStat.isFile()) {
    return [
      {
        absolutePath,
        relativePath: path.basename(absolutePath),
        relativeCwdPath: path.relative(process.cwd(), absolutePath),
      },
    ];
  } else if (fileStat.isDirectory()) {
    return glob
      .sync(path.join(absolutePath, "**"), {
        nodir: true,
        absolute: true,
      })
      .map((globPath) => ({
        absolutePath: globPath,
        relativePath: globPath.slice(absolutePath.length + 1),
        relativeCwdPath: path.relative(process.cwd(), globPath),
      }));
  } else {
    return [];
  }
}

/**
 * Adds rules specified in `ignore` and `ignoreFile` to the ignore rule
 * checker and returns the checker for further use.
 */
function getIgnoreRules(includeEntry: InternalIncludeEntry): Ignore {
  const ignoreChecker = ignore();
  if (includeEntry.ignoreFile) {
    const ignoreFileContent = fs.readFileSync(includeEntry.ignoreFile).toString();
    ignoreChecker.add(ignoreFileContent);
  }
  ignoreChecker.add(includeEntry.ignore);
  return ignoreChecker;
}

function convertWindowsPathToPosix(windowsPath: string): string {
  return windowsPath.split(path.sep).join(path.posix.sep);
}
