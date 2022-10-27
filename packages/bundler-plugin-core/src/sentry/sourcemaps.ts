import path from "path";
import fs, { Stats } from "fs";
import glob from "glob";
import { InternalIncludeEntry } from "../options-mapping";

export type FileRecord = {
  name: string;
  content: string;
};

export function getFiles(fpath: string, includeEntry: InternalIncludeEntry): FileRecord[] {
  let fileStat: Stats;
  const p = path.isAbsolute(fpath) ? fpath : path.resolve(process.cwd(), fpath);
  try {
    fileStat = fs.statSync(p);
  } catch (e) {
    return [];
  }

  let files: {
    absolutePath: string;
    // Contains relative paths without leading `.` (e.g. "foo/bar.js" or "asdf\\a\\b.js.map")
    relativePath: string;
  }[];

  if (fileStat.isFile()) {
    files = [{ absolutePath: p, relativePath: path.basename(p) }];
  } else if (fileStat.isDirectory()) {
    files = glob
      .sync(path.join(p, "**"), {
        nodir: true,
        absolute: true,
      })
      .map((globPath) => ({ absolutePath: globPath, relativePath: globPath.slice(p.length + 1) }));
  } else {
    return [];
  }

  const dotPrefixedAllowedExtensions = includeEntry.ext.map(
    (extension) => `.${extension.replace(/^\./, "")}`
  );

  const filteredFiles = files.filter(({ absolutePath }) => {
    return dotPrefixedAllowedExtensions.includes(path.extname(absolutePath));
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
