import path from "path";
import fs, { Stats } from "fs";
import glob from "glob";
import { InternalIncludeEntry } from "../options-mapping";

import parseIgnoreFile from "parse-gitignore";

export type FileRecord = {
  name: string;
  content: string;
};

export function getFiles(includePath: string, includeEntry: InternalIncludeEntry): FileRecord[] {
  let fileStat: Stats;
  const absolutePath = path.isAbsolute(includePath)
    ? includePath
    : path.resolve(process.cwd(), includePath);
  try {
    fileStat = fs.statSync(absolutePath);
  } catch (e) {
    return [];
  }

  let files: {
    absolutePath: string;
    // Contains relative paths without leading `.` (e.g. "foo/bar.js" or "asdf\\a\\b.js.map")
    relativePath: string;
  }[];

  if (fileStat.isFile()) {
    files = [{ absolutePath, relativePath: path.basename(absolutePath) }];
  } else if (fileStat.isDirectory()) {
    const absoluteIgnores = getIgnoreEntries(includeEntry);

    files = glob
      .sync(path.join(absolutePath, "**"), {
        nodir: true,
        absolute: true,
        ignore: absoluteIgnores,
      })
      .map((globPath) => ({
        absolutePath: globPath,
        relativePath: globPath.slice(absolutePath.length + 1),
      }));
  } else {
    return [];
  }

  const filteredFiles = files.filter(({ absolutePath }) => {
    return includeEntry.ext.includes(path.extname(absolutePath));
  });

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

function convertWindowsPathToPosix(windowsPath: string): string {
  return windowsPath.split(path.sep).join(path.posix.sep);
}

function getIgnoreEntries(includeEntry: InternalIncludeEntry): InternalIncludeEntry["ignore"] {
  const absoluteIgnores = includeEntry.ignore.map((ignoreEntry) => {
    if (ignoreEntry.startsWith("!")) {
      return `!${path.join(process.cwd(), ignoreEntry.replace(/^!/, ""))}`;
    }
    return path.join(process.cwd(), ignoreEntry);
  });

  const absoluteIgnoreFileIgnores = getIgnoreEntriesFromIgnoreFile(includeEntry.ignoreFile);

  return [...absoluteIgnores, ...absoluteIgnoreFileIgnores];
}

function getIgnoreEntriesFromIgnoreFile(ignoreFile: InternalIncludeEntry["ignoreFile"]): string[] {
  // This is what parse-gitignore actually returns after version 2.0.0
  // (including a few other properties we don't need).
  // Using this as a type until the library updates its type declarations.
  type ParseIgnoreReturn = {
    patterns: string[];
  };

  if (!ignoreFile) {
    return [];
  }

  // The parse-gitignore library's types declaration file was not updated to v2.0.0.
  // Hence, we have to override its return value (and ignore the linter who rightfully complains)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const fileContent = parseIgnoreFile(fs.readFileSync(ignoreFile)) as unknown as ParseIgnoreReturn;
  const patterns = fileContent.patterns;

  return patterns.map((ignoreEntry) => {
    const ignoreFileDir = path.dirname(path.resolve(ignoreFile));
    if (ignoreEntry.startsWith("!")) {
      return `!${path.join(ignoreFileDir, ignoreEntry.replace(/^!/, ""))}`;
    }
    return path.join(path.join(ignoreFileDir, ignoreEntry));
  });
}
