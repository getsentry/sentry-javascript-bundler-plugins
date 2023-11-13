import { Logger } from "../sentry/logger";
import { getSentryPackagesInNpm } from "./npm";
import { NPM, PNPM, PackageManager, YARN, detectPackageManager } from "./package-manager";
import { getSentryPackagesInPnpm } from "./pnpm";
import { LockEntry, findMismatchedEntries, warnForMismatchedEntries } from "./utils";
import { getSentryPackagesInYarn } from "./yarn";

export async function warnForMismatchedSentryPackages(logger: Logger): Promise<void> {
  const packageManager = detectPackageManager();

  if (!packageManager) {
    return;
  }

  const entries = await getSentryEntries(packageManager);

  const mismatched = findMismatchedEntries(entries);
  warnForMismatchedEntries(logger, mismatched);
}

async function getSentryEntries(packageManager: PackageManager): Promise<LockEntry[]> {
  if (packageManager === YARN) {
    return getSentryPackagesInYarn();
  }

  if (packageManager === NPM) {
    return getSentryPackagesInNpm();
  }

  if (packageManager === PNPM) {
    return await getSentryPackagesInPnpm();
  }

  return [];
}
