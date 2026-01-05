/**
 * Test for GitHub Issue #829:
 * sentryVitePlugin creates unnecessary JS modules for each index page
 *
 * In a Vite multi-page app (MPA), sentryVitePlugin causes "vite build" to emit
 * a separate, unique, unexpected JS module for each index page.
 *
 * Expected: The plugin should add metadata to generated modules but should NOT
 * rework the import graph, create new modules, or add script tags to pages
 * that didn't have them in the first place.
 *
 * Actual: A unique module is generated for every HTML page in rollup.options.input.
 * Pages that had been sharing modules will instead load a page-specific module
 * that imports the shared code. Pages that didn't contain ANY scripts will now have one.
 */
import childProcess from "child_process";
import fs from "fs";
import path from "path";

function getAssetFiles(outDir: string): string[] {
  const assetsDir = path.join(outDir, "assets");
  if (!fs.existsSync(assetsDir)) {
    return [];
  }
  return fs.readdirSync(assetsDir).filter((file) => file.endsWith(".js"));
}

function getScriptTagsFromHtml(htmlPath: string): string[] {
  if (!fs.existsSync(htmlPath)) {
    return [];
  }
  const content = fs.readFileSync(htmlPath, "utf-8");
  const scriptMatches = content.match(/<script[^>]*>/g) || [];
  return scriptMatches;
}

describe("Vite MPA Extra Modules Issue (#829)", () => {
  const outWithoutPlugin = path.join(__dirname, "out", "without-plugin");
  const outWithPlugin = path.join(__dirname, "out", "with-plugin");

  beforeAll(() => {
    // Clean output directories
    if (fs.existsSync(outWithoutPlugin)) {
      fs.rmSync(outWithoutPlugin, { recursive: true });
    }
    if (fs.existsSync(outWithPlugin)) {
      fs.rmSync(outWithPlugin, { recursive: true });
    }

    // Build without plugin
    childProcess.execSync(
      `yarn ts-node ${path.join(__dirname, "build-vite-without-plugin.ts")}`,
      { encoding: "utf-8", stdio: "inherit" }
    );

    // Build with plugin
    childProcess.execSync(
      `yarn ts-node ${path.join(__dirname, "build-vite-with-plugin.ts")}`,
      { encoding: "utf-8", stdio: "inherit" }
    );
  }, 60_000);

  it("should not create extra JS modules when sentry plugin is enabled", () => {
    const assetsWithoutPlugin = getAssetFiles(outWithoutPlugin);
    const assetsWithPlugin = getAssetFiles(outWithPlugin);

    console.log("Assets without plugin:", assetsWithoutPlugin);
    console.log("Assets with plugin:", assetsWithPlugin);

    // The number of JS files should be the same (or very close)
    // With the bug, the plugin creates extra modules like index.js, page1.js, page2.js
    // for each HTML entry point
    expect(assetsWithPlugin.length).toBeLessThanOrEqual(assetsWithoutPlugin.length + 1);
  });

  it("should not add script tags to HTML pages that had none", () => {
    // index.html originally has no scripts
    const indexWithoutPlugin = getScriptTagsFromHtml(
      path.join(outWithoutPlugin, "index.html")
    );
    const indexWithPlugin = getScriptTagsFromHtml(
      path.join(outWithPlugin, "index.html")
    );

    console.log("index.html scripts without plugin:", indexWithoutPlugin);
    console.log("index.html scripts with plugin:", indexWithPlugin);

    // The number of script tags should be the same
    // With the bug, index.html gets a script tag added even though it had none
    expect(indexWithPlugin.length).toBe(indexWithoutPlugin.length);
  });

  it("should preserve shared module imports without creating page-specific wrappers", () => {
    // page1.html and page2.html should both reference the same shared module
    // not page-specific modules
    const page1WithPlugin = fs.readFileSync(
      path.join(outWithPlugin, "page1.html"),
      "utf-8"
    );
    const page2WithPlugin = fs.readFileSync(
      path.join(outWithPlugin, "page2.html"),
      "utf-8"
    );

    // Extract the JS file references
    const page1ScriptMatch = page1WithPlugin.match(/src="([^"]+\.js)"/);
    const page2ScriptMatch = page2WithPlugin.match(/src="([^"]+\.js)"/);

    console.log("page1 script src:", page1ScriptMatch?.[1]);
    console.log("page2 script src:", page2ScriptMatch?.[1]);

    if (page1ScriptMatch && page2ScriptMatch) {
      // Both pages should reference the same shared module, not page-specific ones
      // With the bug, page1.html references page1-xxx.js and page2.html references page2-xxx.js
      // instead of both referencing shared-module-xxx.js
      const page1Script = page1ScriptMatch[1];
      const page2Script = page2ScriptMatch[1];

      // They should NOT be page-specific (named after the page)
      expect(page1Script).not.toMatch(/page1/i);
      expect(page2Script).not.toMatch(/page2/i);
    }
  });
});

