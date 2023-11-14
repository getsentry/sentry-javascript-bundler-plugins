import { NPM, PNPM, YARN, detectPackageManager } from "../../src/sentry-packages/package-manager";
import { join } from "node:path";

describe("detectPackageManager", () => {
  it("works without any lockfile", () => {
    const actual = detectPackageManager(join(__dirname, "../fixtures/nested-package"));
    expect(actual).toBeNull();
  });

  it("works with yarn.lock", () => {
    const actual = detectPackageManager(join(__dirname, "../fixtures/lockfile-yarn"));
    expect(actual).toBe(YARN);
  });

  it("works with pnpm-lock.yml", () => {
    const actual = detectPackageManager(join(__dirname, "../fixtures/lockfile-pnpm"));
    expect(actual).toBe(PNPM);
  });

  it("works with package-lock.json", () => {
    const actual = detectPackageManager(join(__dirname, "../fixtures/lockfile-npm"));
    expect(actual).toBe(NPM);
  });
});
