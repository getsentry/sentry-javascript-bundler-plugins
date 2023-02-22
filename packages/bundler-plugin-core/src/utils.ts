import findUp from "find-up";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

/**
 * Checks whether the given input is already an array, and if it isn't, wraps it in one.
 *
 * @param maybeArray Input to turn into an array, if necessary
 * @returns The input, if already an array, or an array with the input as the only element, if not
 */
export function arrayify<T = unknown>(maybeArray: T | T[]): T[] {
  return Array.isArray(maybeArray) ? maybeArray : [maybeArray];
}

type PackageJson = Record<string, unknown>;

/**
 * Get the closes package.json from a given starting point upwards.
 * This handles a few edge cases:
 * * Check if a given file package.json appears to be an actual NPM package.json file
 * * Stop at the home dir, to avoid looking too deeply
 */
export function getPackageJson({ cwd, stopAt }: { cwd?: string; stopAt?: string } = {}):
  | PackageJson
  | undefined {
  return lookupPackageJson(cwd ?? process.cwd(), path.normalize(stopAt ?? os.homedir()));
}

export function parseMajorVersion(version: string): number | undefined {
  // if it has a `v` prefix, remove it
  if (version.startsWith("v")) {
    version = version.slice(1);
  }

  // First, try simple lookup of exact, ~ and ^ versions
  const regex = /^[\^~]?(\d+)(\.\d+)?(\.\d+)?(-.+)?/;

  const match = version.match(regex);
  if (match) {
    return parseInt(match[1] as string, 10);
  }

  // Try to parse e.g. 1.x
  const coerced = parseInt(version, 10);
  if (!Number.isNaN(coerced)) {
    return coerced;
  }

  // Match <= and >= ranges.
  const gteLteRegex = /^[<>]=\s*(\d+)(\.\d+)?(\.\d+)?(-.+)?/;
  const gteLteMatch = version.match(gteLteRegex);
  if (gteLteMatch) {
    return parseInt(gteLteMatch[1] as string, 10);
  }

  // match < ranges
  const ltRegex = /^<\s*(\d+)(\.\d+)?(\.\d+)?(-.+)?/;
  const ltMatch = version.match(ltRegex);
  if (ltMatch) {
    // Two scenarios:
    // a) < 2.0.0 --> return 1
    // b) < 2.1.0 --> return 2

    const major = parseInt(ltMatch[1] as string, 10);

    if (
      // minor version > 0
      (typeof ltMatch[2] === "string" && parseInt(ltMatch[2].slice(1), 10) > 0) ||
      // patch version > 0
      (typeof ltMatch[3] === "string" && parseInt(ltMatch[3].slice(1), 10) > 0)
    ) {
      return major;
    }

    return major - 1;
  }

  // match > ranges
  const gtRegex = /^>\s*(\d+)(\.\d+)?(\.\d+)?(-.+)?/;
  const gtMatch = version.match(gtRegex);
  if (gtMatch) {
    // We always return the version here, even though it _may_ be incorrect
    // E.g. if given > 2.0.0, it should be 2 if there exists any 2.x.x version, else 3
    // Since there is no way for us to know this, we're going to assume any kind of patch/feature release probably exists
    return parseInt(gtMatch[1] as string, 10);
  }
  return undefined;
}

// This is an explicit list of packages where we want to include the (major) version number.
const PACKAGES_TO_INCLUDE_VERSION = [
  "react",
  "@angular/core",
  "vue",
  "ember-source",
  "svelte",
  "@sveltejs/kit",
  "webpack",
  "vite",
  "gatsby",
  "next",
  "remix",
  "rollup",
  "esbuild",
];

export function getDependencies(packageJson: PackageJson): {
  deps: string[];
  depsVersions: Record<string, number>;
} {
  const dependencies: Record<string, string> = Object.assign(
    {},
    packageJson["devDependencies"] ?? {},
    packageJson["dependencies"] ?? {}
  );

  const deps = Object.keys(dependencies).sort();

  const depsVersions: Record<string, number> = deps.reduce((depsVersions, depName) => {
    if (PACKAGES_TO_INCLUDE_VERSION.includes(depName)) {
      const version = dependencies[depName] as string;
      const majorVersion = parseMajorVersion(version);
      if (majorVersion) {
        depsVersions[depName] = majorVersion;
      }
    }
    return depsVersions;
  }, {} as Record<string, number>);

  return { deps, depsVersions };
}

function lookupPackageJson(cwd: string, stopAt: string): PackageJson | undefined {
  const jsonPath = findUp.sync(
    (dirName) => {
      // Stop if we reach this dir
      if (path.normalize(dirName) === stopAt) {
        return findUp.stop;
      }

      return findUp.sync.exists(dirName + "/package.json") ? "package.json" : undefined;
    },
    { cwd }
  );

  if (!jsonPath) {
    return undefined;
  }

  try {
    const jsonStr = fs.readFileSync(jsonPath, "utf8");
    const json = JSON.parse(jsonStr) as PackageJson;

    // Ensure it is an actual package.json
    // This is very much not bulletproof, but should be good enough
    if ("name" in json || "private" in json) {
      return json;
    }
  } catch (error) {
    // Ignore and walk up
  }

  // Continue up the tree, if we find a fitting package.json
  const newCwd = path.dirname(path.resolve(jsonPath + "/.."));
  return lookupPackageJson(newCwd, stopAt);
}
