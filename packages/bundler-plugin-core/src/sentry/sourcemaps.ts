import path from "path";
import fs, { Stats } from "fs";
import glob from "glob";
import { InternalIncludeEntry } from "../options-mapping";

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
    files = glob
      .sync(path.join(absolutePath, "**"), {
        nodir: true,
        absolute: true,
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

  // TODO ignore files
  // TODO ignorefile
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
