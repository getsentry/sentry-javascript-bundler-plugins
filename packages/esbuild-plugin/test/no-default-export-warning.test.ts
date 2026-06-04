import { sentryEsbuildPlugin } from "../src";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as esbuild from "esbuild";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

describe("esbuild proxy module default export handling", () => {
  let tmpDir: string;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sentry-esbuild-test-"));
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("should build successfully without warnings when entry point has no default export", async () => {
    const inputFile = path.join(tmpDir, "no-default.ts");
    fs.writeFileSync(
      inputFile,
      [
        'import * as path from "path";',
        'console.log("No default export here", path.sep);',
        "",
      ].join("\n")
    );

    const outDir = path.join(tmpDir, "out-no-default");
    const result = await esbuild.build({
      entryPoints: [inputFile],
      sourcemap: true,
      bundle: true,
      outdir: outDir,
      platform: "node",
      plugins: [
        sentryEsbuildPlugin({
          telemetry: false,
          release: { name: "test-release", create: false },
        }),
      ],
      write: true,
    });

    // If esbuild version is new enough, warnings about "Import 'default' will always be
    // undefined" will be captured in result.warnings. On older esbuild versions this array
    // may be empty regardless, so the test at least verifies no build errors occur.
    const importUndefinedWarnings = (result.warnings || []).filter(
      (w) => w.text.includes("Import") && w.text.includes("default") && w.text.includes("undefined")
    );

    expect(importUndefinedWarnings).toHaveLength(0);
  });

  it("should preserve default export when the entry point has one", async () => {
    const inputFile = path.join(tmpDir, "with-default.ts");
    fs.writeFileSync(
      inputFile,
      ["export const foo = 42;", 'export default function main() { return "hello"; }', ""].join(
        "\n"
      )
    );

    const outDir = path.join(tmpDir, "out-with-default");
    const result = await esbuild.build({
      entryPoints: [inputFile],
      sourcemap: true,
      bundle: true,
      outdir: outDir,
      platform: "node",
      format: "esm",
      plugins: [
        sentryEsbuildPlugin({
          telemetry: false,
          release: { name: "test-release", create: false },
        }),
      ],
      write: true,
    });

    // Should produce no warnings
    const importUndefinedWarnings = (result.warnings || []).filter(
      (w) => w.text.includes("Import") && w.text.includes("default") && w.text.includes("undefined")
    );
    expect(importUndefinedWarnings).toHaveLength(0);

    // Verify the output contains the default export function
    const outputFiles = fs.readdirSync(outDir).filter((f) => f.endsWith(".js"));
    expect(outputFiles.length).toBeGreaterThan(0);

    const outputContent = fs.readFileSync(path.join(outDir, outputFiles[0] as string), "utf-8");
    expect(outputContent).toContain("main");
  });

  it("should preserve named exports when the entry point has no default export", async () => {
    const inputFile = path.join(tmpDir, "named-only.ts");
    fs.writeFileSync(
      inputFile,
      ["export const foo = 42;", 'export const bar = "hello";', ""].join("\n")
    );

    const outDir = path.join(tmpDir, "out-named-only");
    const result = await esbuild.build({
      entryPoints: [inputFile],
      sourcemap: true,
      bundle: true,
      outdir: outDir,
      platform: "node",
      format: "esm",
      plugins: [
        sentryEsbuildPlugin({
          telemetry: false,
          release: { name: "test-release", create: false },
        }),
      ],
      write: true,
    });

    // Should produce no warnings
    const importUndefinedWarnings = (result.warnings || []).filter(
      (w) => w.text.includes("Import") && w.text.includes("default") && w.text.includes("undefined")
    );
    expect(importUndefinedWarnings).toHaveLength(0);

    // Verify the output contains the named exports
    const outputFiles = fs.readdirSync(outDir).filter((f) => f.endsWith(".js"));
    expect(outputFiles.length).toBeGreaterThan(0);

    const outputContent = fs.readFileSync(path.join(outDir, outputFiles[0] as string), "utf-8");
    expect(outputContent).toContain("foo");
    expect(outputContent).toContain("bar");
  });
});
