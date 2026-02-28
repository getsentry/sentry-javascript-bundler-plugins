import { execSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const DEBUG = !!process.env["DEBUG"];
const CURRENT_SHA = execSync("git rev-parse HEAD", { encoding: "utf-8" }).trim();

export function runBundler(
  command: string,
  options: { cwd: string },
  env: Record<string, string | undefined>
): void {
  execSync(command, { cwd: options.cwd, stdio: DEBUG ? "inherit" : "ignore", env });
}

export function readAllFiles(directory: string): Record<string, string> {
  const files: Record<string, string> = {};
  const entries = readdirSync(directory);

  for (const entry of entries) {
    const fullPath = join(directory, entry);
    const stat = statSync(fullPath);

    if (stat.isFile()) {
      let contents = readFileSync(fullPath, "utf-8");
      // We replace the current SHA with a placeholder to make snapshots deterministic
      contents = contents.replace(CURRENT_SHA, "CURRENT_SHA");
      files[entry] = contents;
    }
  }

  return files;
}
