import path from "node:path";
import fs from "node:fs";
import * as lockfile from "@yarnpkg/lockfile";
import { LockEntry, isSentryPackage } from "./utils";

export function getSentryPackagesInYarn(cwd = process.cwd()): LockEntry[] {
  try {
    const yarnFileContent = fs.readFileSync(path.join(cwd, "yarn.lock"), "utf-8");
    return getSentryPackagesFromYarnLockfile(yarnFileContent);
  } catch (e) {
    return [];
  }
}

function getSentryPackagesFromYarnLockfile(yarnLockFileContent: string): LockEntry[] {
  const parse: typeof lockfile.parse =
    lockfile.parse || (lockfile as unknown as { default: typeof lockfile }).default.parse;
  const yarnLock = parse(yarnLockFileContent);
  const lockEntries = yarnLock.object;

  const entries: LockEntry[] = [];

  /**
   * The object keys look like this:
   * @sentry/core@^7.50.0
   */
  for (const lockedPackage in lockEntries) {
    const info = lockEntries[lockedPackage] as { version: string };

    const splitPos = lockedPackage.lastIndexOf("@");
    const packageName = lockedPackage.substring(0, splitPos);

    if (isSentryPackage(packageName)) {
      entries.push({
        packageName,
        actualVersion: info.version,
      });
    }
  }

  return entries;
}
