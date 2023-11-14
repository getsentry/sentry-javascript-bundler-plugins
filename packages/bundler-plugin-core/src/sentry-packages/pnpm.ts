import * as lockfile from "@pnpm/lockfile-file";
import { LockEntry, isSentryPackage } from "./utils";

export async function getSentryPackagesInPnpm(cwd = process.cwd()): Promise<LockEntry[]> {
  try {
    const parsed = await lockfile.readWantedLockfile(cwd, { ignoreIncompatible: false });
    if (!parsed) {
      return [];
    }
    return getSentryPackagesFromPnpmLockfile(parsed);
  } catch {
    return [];
  }
}

function getSentryPackagesFromPnpmLockfile(parsed: lockfile.Lockfile) {
  const { packages } = parsed;

  if (!packages) {
    return [];
  }

  /**
   * The object keys look like this:
   * - '/@sentry/react/7.50.0(react@18.2.0)' - we can have a suffix that we do not care about
   * - '/@sentry/react/7.50.0-alpha.1' - we may have a prerelease
   */
  const regex = /(@sentry(?:-internal)?)\/([\w-]+)\/([\d.]+)(-[\w.]+)?/;

  const entries: LockEntry[] = [];

  for (const entryName in packages) {
    const match = entryName.match(regex) as [string, string, string, string, string | undefined];

    if (!match) {
      continue;
    }

    const [, packagePrefix, packageSuffix, version, versionSuffix] = match;

    const packageName = `${packagePrefix}/${packageSuffix}`;
    const actualVersion = versionSuffix ? `${version}${versionSuffix}` : version;

    if (isSentryPackage(packageName)) {
      entries.push({
        packageName,
        actualVersion,
      });
    }
  }
  return entries;
}
