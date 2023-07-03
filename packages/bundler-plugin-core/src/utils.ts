import findUp from "find-up";
import path from "path";
import fs from "fs";
import os from "os";
import crypto from "crypto";
import childProcess from "child_process";

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

/**
 * Deterministically hashes a string and turns the hash into a uuid.
 */
export function stringToUUID(str: string): string {
  const md5sum = crypto.createHash("md5");
  md5sum.update(str);
  const md5Hash = md5sum.digest("hex");

  // Position 16 is fixed to either 8, 9, a, or b in the uuid v4 spec (10xx in binary)
  // RFC 4122 section 4.4
  const v4variant = ["8", "9", "a", "b"][md5Hash.substring(16, 17).charCodeAt(0) % 4] as string;

  return (
    md5Hash.substring(0, 8) +
    "-" +
    md5Hash.substring(8, 12) +
    "-4" +
    md5Hash.substring(13, 16) +
    "-" +
    v4variant +
    md5Hash.substring(17, 20) +
    "-" +
    md5Hash.substring(20)
  ).toLowerCase();
}

/**
 * Tries to guess a release name based on environmental data.
 */
export function determineReleaseName(): string | undefined {
  let gitRevision: string | undefined;
  try {
    gitRevision = childProcess.execSync("git rev-parse HEAD").toString().trim();
  } catch (e) {
    // noop
  }

  return (
    // GitHub Actions - https://help.github.com/en/actions/configuring-and-managing-workflows/using-environment-variables#default-environment-variables
    process.env["GITHUB_SHA"] ||
    // Netlify - https://docs.netlify.com/configure-builds/environment-variables/#build-metadata
    process.env["COMMIT_REF"] ||
    // Cloudflare Pages - https://developers.cloudflare.com/pages/platform/build-configuration/#environment-variables
    process.env["CF_PAGES_COMMIT_SHA"] ||
    // AWS CodeBuild - https://docs.aws.amazon.com/codebuild/latest/userguide/build-env-ref-env-vars.html
    process.env["CODEBUILD_RESOLVED_SOURCE_VERSION"] ||
    // CircleCI - https://circleci.com/docs/2.0/env-vars/
    process.env["CIRCLE_SHA1"] ||
    // Vercel - https://vercel.com/docs/v2/build-step#system-environment-variables
    process.env["VERCEL_GIT_COMMIT_SHA"] ||
    process.env["VERCEL_GITHUB_COMMIT_SHA"] ||
    process.env["VERCEL_GITLAB_COMMIT_SHA"] ||
    process.env["VERCEL_BITBUCKET_COMMIT_SHA"] ||
    // Zeit (now known as Vercel)
    process.env["ZEIT_GITHUB_COMMIT_SHA"] ||
    process.env["ZEIT_GITLAB_COMMIT_SHA"] ||
    process.env["ZEIT_BITBUCKET_COMMIT_SHA"] ||
    gitRevision
  );
}

/**
 * Generates code for the global injector which is responsible for setting the global
 * `SENTRY_RELEASE` & `SENTRY_BUILD_INFO` variables.
 */
export function generateGlobalInjectorCode({
  release,
  injectBuildInformation,
}: {
  release: string;
  injectBuildInformation: boolean;
}) {
  // The code below is mostly ternary operators because it saves bundle size.
  // The checks are to support as many environments as possible. (Node.js, Browser, webworkers, etc.)
  let code = `
    var _global =
      typeof window !== 'undefined' ?
        window :
        typeof global !== 'undefined' ?
          global :
          typeof self !== 'undefined' ?
            self :
            {};

    _global.SENTRY_RELEASE={id:"${release}"};`;

  if (injectBuildInformation) {
    const buildInfo = getBuildInformation();

    code += `
      _global.SENTRY_BUILD_INFO=${JSON.stringify(buildInfo)};`;
  }

  return code;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateModuleMetadataInjectorCode(metadata: any) {
  // The code below is mostly ternary operators because it saves bundle size.
  // The checks are to support as many environments as possible. (Node.js, Browser, webworkers, etc.)
  return `
    var _global2 =
      typeof window !== 'undefined' ?
        window :
        typeof global !== 'undefined' ?
          global :
          typeof self !== 'undefined' ?
            self :
            {};

    _global2._sentryModuleMetadata = _global2._sentryModuleMetadata || {};
    _global2._sentryModuleMetadata[new Error().stack] = ${JSON.stringify(metadata)};`;
}

function getBuildInformation() {
  const packageJson = getPackageJson();

  const { deps, depsVersions } = packageJson
    ? getDependencies(packageJson)
    : { deps: [], depsVersions: {} };

  return {
    deps,
    depsVersions,
    nodeVersion: parseMajorVersion(process.version),
  };
}

export function stripQueryAndHashFromPath(path: string): string {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return path.split("?")[0]!.split("#")[0]!;
}
