import { Logger } from "../sentry/logger";

export interface LockEntry {
  packageName: string;
  actualVersion: string;
}

const SENTY_PACKAGE_NAME_PARTIAL = "@sentry/";
const SENTRY_PACKAGE_NAMES_EXACT = ["@sentry-internal/tracing"];

/** Check if the given package name is a package we want to consider here. */
export function isSentryPackage(packageName: string): boolean {
  return (
    packageName.startsWith(SENTY_PACKAGE_NAME_PARTIAL) ||
    SENTRY_PACKAGE_NAMES_EXACT.some((fullMatch) => packageName === fullMatch)
  );
}

export function findMismatchedEntries(entries: LockEntry[]): Record<string, string[]> {
  const mismatched: Record<string, string[]> = {};

  const grouped: Record<string, LockEntry[]> = {};

  entries.forEach((entry) => {
    if (!grouped[entry.packageName]) {
      grouped[entry.packageName] = [];
    }

    grouped[entry.packageName]!.push(entry);
  });

  for (const packageName in grouped) {
    const entries = grouped[packageName]!;

    const actualVersions = new Set(entries.map((entry) => entry.actualVersion));

    if (actualVersions.size > 1) {
      mismatched[packageName] = Array.from(actualVersions);
    }
  }

  return mismatched;
}

export function warnForMismatchedEntries(
  logger: Logger,
  mismatched: Record<string, string[]>
): void {
  const pkgNames = Object.keys(mismatched);

  if (!pkgNames.length) {
    return;
  }

  logger.warn(`Found mismatched installed versions for the following Sentry packages:
${pkgNames
  .map((pkgName) => {
    const actualVersions = mismatched[pkgName] as string[];
    return `  ${pkgName}: ${actualVersions.sort().join(", ")}`;
  })
  .join("\n")}

Only a single version of these packages should be installed.
Please make sure to update & align your dependencies accordingly, or you may experience unexpected behavior.`);
}
