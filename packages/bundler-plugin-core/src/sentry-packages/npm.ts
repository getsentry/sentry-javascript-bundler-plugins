import path from "node:path";
import fs from "node:fs";
import { LockEntry, isSentryPackage } from "./utils";

interface PackageLockEntry {
  version: string;
}

export function getSentryPackagesInNpm(cwd = process.cwd()): LockEntry[] {
  try {
    const fileContent = fs.readFileSync(path.join(cwd, "package-lock.json"), "utf-8");
    return getSentryPackagesFromNpmLockfile(fileContent);
  } catch {
    return [];
  }
}

function getSentryPackagesFromNpmLockfile(fileContent: string): LockEntry[] {
  const json = JSON.parse(fileContent) as { packages: Record<string, PackageLockEntry> };
  const packages = json.packages;

  const entries: LockEntry[] = [];

  /**
   * The object keys look like this:
   * node_modules/@sentry/browser/node_modules/@sentry/utils
   * node_modules/@sentry/bundler-plugin-core
   */
  for (const entryName in packages) {
    const info = packages[entryName] as PackageLockEntry;
    const splitPos = entryName.lastIndexOf("@");
    if (splitPos === -1) {
      continue;
    }

    const packageName = entryName.substring(splitPos);

    if (isSentryPackage(packageName)) {
      entries.push({
        packageName,
        actualVersion: info.version,
      });
    }
  }

  return entries;
}
