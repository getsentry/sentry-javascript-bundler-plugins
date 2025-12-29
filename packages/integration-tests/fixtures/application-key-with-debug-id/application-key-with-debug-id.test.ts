/* eslint-disable jest/no-standalone-expect */
/* eslint-disable jest/expect-expect */
import { execSync } from "child_process";
import path from "path";
import { testIfNodeMajorVersionIsLessThan18 } from "../../utils/testIf";

interface BundleOutput {
  debugIds: Record<string, string> | undefined;
  metadata: Record<string, unknown> | undefined;
}

function checkBundle(bundlePath: string): void {
  const output = execSync(`node ${bundlePath}`, { encoding: "utf-8" });
  const result = JSON.parse(output) as BundleOutput;

  // Check that debug IDs are present
  expect(result.debugIds).toBeDefined();
  const debugIds = Object.values(result.debugIds ?? {});
  expect(debugIds.length).toBeGreaterThan(0);
  // Verify debug ID format (UUID v4)
  expect(debugIds).toContainEqual(
    expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  );
  // The key should be a stack trace
  expect(Object.keys(result.debugIds ?? {})[0]).toContain("Error");

  // Check that applicationKey metadata is present
  expect(result.metadata).toBeDefined();
  const metadataValues = Object.values(result.metadata ?? {});
  expect(metadataValues).toHaveLength(1);
  // applicationKey sets a special key in the metadata
  expect(metadataValues[0]).toEqual({ "_sentryBundlerPluginAppKey:my-app-key": true });
  // The key should be a stack trace
  expect(Object.keys(result.metadata ?? {})[0]).toContain("Error");
}

describe("applicationKey with debug ID injection", () => {
  testIfNodeMajorVersionIsLessThan18("webpack 4 bundle", () => {
    checkBundle(path.join(__dirname, "out", "webpack4", "bundle.js"));
  });

  test("webpack 5 bundle", () => {
    checkBundle(path.join(__dirname, "out", "webpack5", "bundle.js"));
  });

  test("esbuild bundle", () => {
    checkBundle(path.join(__dirname, "out", "esbuild", "bundle.js"));
  });

  test("rollup bundle", () => {
    checkBundle(path.join(__dirname, "out", "rollup", "bundle.js"));
  });

  test("vite bundle", () => {
    checkBundle(path.join(__dirname, "out", "vite", "bundle.js"));
  });
});
