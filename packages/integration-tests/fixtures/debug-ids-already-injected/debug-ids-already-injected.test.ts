import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import { describeNode18Plus } from "../../utils/testIf";
import { execSync } from "child_process";

function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "sentry-bundler-plugin-upload-"));
}

const SPEC_DEBUG_ID_REGEX = /\/\/# debugId=([a-fA-F0-9-]+)/g;

function countDebugIdComments(source: string): number {
  const matches = source.match(SPEC_DEBUG_ID_REGEX);
  if (matches) {
    return matches.length;
  }
  return 0;
}

function getSingleJavaScriptSourceFileFromDirectory(
  dir: string,
  fileExtension = ".js"
): string | undefined {
  const files = fs.readdirSync(dir);
  const jsFiles = files.filter((file) => file.endsWith(fileExtension));
  if (jsFiles.length === 1) {
    return fs.readFileSync(path.join(dir, jsFiles[0] as string), "utf-8");
  }
  return undefined;
}

describeNode18Plus("vite 6 bundle", () => {
  const viteRoot = path.join(__dirname, "input", "vite6");
  const tempDir = createTempDir();

  beforeEach(() => {
    execSync("yarn install", { cwd: viteRoot, stdio: "inherit" });
    execSync("yarn vite build", {
      cwd: viteRoot,
      stdio: "inherit",
      env: { ...process.env, SENTRY_TEST_OVERRIDE_TEMP_DIR: tempDir },
    });
  });

  test("check vite 6 bundle", () => {
    const source = getSingleJavaScriptSourceFileFromDirectory(tempDir);
    expect(source).toBeDefined();
    const debugIds = countDebugIdComments(source as string);
    expect(debugIds).toBe(1);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});

describeNode18Plus("webpack 5 bundle", () => {
  const webpackRoot = path.join(__dirname, "input", "webpack5");
  const tempDir = createTempDir();

  beforeEach(() => {
    execSync("yarn install", { cwd: webpackRoot, stdio: "inherit" });
    execSync("yarn webpack build", {
      cwd: webpackRoot,
      stdio: "inherit",
      env: { ...process.env, SENTRY_TEST_OVERRIDE_TEMP_DIR: tempDir },
    });
  });

  test("check webpack 5 bundle", () => {
    const source = getSingleJavaScriptSourceFileFromDirectory(tempDir);
    expect(source).toBeDefined();
    const debugIds = countDebugIdComments(source as string);
    expect(debugIds).toBe(1);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});

describeNode18Plus("rollup bundle", () => {
  const rollupRoot = path.join(__dirname, "input", "rollup4");
  const tempDir = createTempDir();

  beforeEach(() => {
    execSync("yarn install", { cwd: rollupRoot, stdio: "inherit" });
    execSync("yarn rollup --config rollup.config.js", {
      cwd: rollupRoot,
      stdio: "inherit",
      env: { ...process.env, SENTRY_TEST_OVERRIDE_TEMP_DIR: tempDir },
    });
  });

  test("check rollup bundle", () => {
    const source = getSingleJavaScriptSourceFileFromDirectory(tempDir);
    expect(source).toBeDefined();
    const debugIds = countDebugIdComments(source as string);
    expect(debugIds).toBe(1);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});
