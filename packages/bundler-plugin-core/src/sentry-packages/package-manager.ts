import fs from "node:fs";
import path from "node:path";

export interface PackageManager {
  name: string;
  lockFile: string;
}

export const YARN: PackageManager = {
  name: "yarn",
  lockFile: "yarn.lock",
};
export const PNPM: PackageManager = {
  name: "pnpm",
  lockFile: "pnpm-lock.yaml",
};
export const NPM: PackageManager = {
  name: "npm",
  lockFile: "package-lock.json",
};

export const packageManagers = [YARN, PNPM, NPM];

export function detectPackageManager(cwd = process.cwd()): PackageManager | null {
  for (const packageManager of packageManagers) {
    if (fs.existsSync(path.join(cwd, packageManager.lockFile))) {
      return packageManager;
    }
  }
  return null;
}
