import childProcess from "child_process";
import path from "path";
import { test, expect } from "vitest";

const SNAPSHOT = `"<div><span data-sentry-component="ComponentA">Component A</span></div>"`;
const ESBUILD_SNAPSHOT = `"<div><span>Component A</span></div>"`;

function runBundle(bundlePath: string): string {
  const processOutput = childProcess.execSync(`node ${bundlePath}`, { encoding: "utf-8" });
  return processOutput.trim();
}

test("esbuild bundle", () => {
  expect.assertions(1);
  expect(runBundle(path.join(__dirname, "./out/esbuild/index.js"))).toMatchInlineSnapshot(
    ESBUILD_SNAPSHOT
  );
});

test("rollup bundle", () => {
  expect.assertions(1);
  expect(runBundle(path.join(__dirname, "./out/rollup/index.js"))).toMatchInlineSnapshot(SNAPSHOT);
});

test("vite bundle", () => {
  expect.assertions(1);
  expect(runBundle(path.join(__dirname, "./out/vite/index.js"))).toMatchInlineSnapshot(SNAPSHOT);
});

test("webpack bundle", () => {
  expect.assertions(1);
  expect(runBundle(path.join(__dirname, "./out/webpack/index.js"))).toMatchInlineSnapshot(SNAPSHOT);
});
