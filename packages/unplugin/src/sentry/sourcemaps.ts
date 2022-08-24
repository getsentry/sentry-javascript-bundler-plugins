import path from "path";
import fs from "fs";

export type FileRecord = {
  name: string;
  content: string;
};

export function getFiles(path: string, allowedExtensions: string[]): FileRecord[] {
  const includedFiles = getAllIncludedFileNames(path, allowedExtensions, []);

  return includedFiles.map((filename) => {
    const content = fs.readFileSync(filename, { encoding: "utf-8" });
    return { name: "~" + filename.replace(new RegExp(`^${path}`), ""), content };
  });
}

function getAllIncludedFileNames(
  dirPath: string,
  allowedExtensions: string[],
  accFiles: string[]
): string[] {
  let allFiles = accFiles;
  const files = fs.readdirSync(dirPath);

  files
    .map((file) => path.join(dirPath, "/", file))
    .forEach((file) => {
      if (fs.statSync(file).isDirectory()) {
        allFiles = getAllIncludedFileNames(file, allowedExtensions, allFiles);
      } else {
        if (allowedExtensions.some((e) => file.endsWith(e))) {
          allFiles.push(file);
        }
      }
    });

  return allFiles;
}
