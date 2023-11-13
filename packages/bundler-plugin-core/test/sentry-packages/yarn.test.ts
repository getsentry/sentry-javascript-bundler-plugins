import { getSentryPackagesInYarn } from "../../src/sentry-packages/yarn";
import { join } from "node:path";

describe("yarn", () => {
  describe("getSentryPackagesInYarn", () => {
    it("works with empty lockfile", () => {
      const actual = getSentryPackagesInYarn(join(__dirname, "../fixtures/lockfile-yarn-empty"));
      expect(actual).toEqual([]);
    });

    it("works with lockfile", () => {
      const actual = getSentryPackagesInYarn(join(__dirname, "../fixtures/lockfile-yarn"));

      expect(actual).toEqual([
        { packageName: "@sentry-internal/tracing", actualVersion: "7.50.0" },
        { packageName: "@sentry-internal/tracing", actualVersion: "7.60.0" },
        { packageName: "@sentry/cli", actualVersion: "2.21.2" },
        { packageName: "@sentry/core", actualVersion: "7.50.0" },
        { packageName: "@sentry/core", actualVersion: "7.60.0" },
        { packageName: "@sentry/integrations", actualVersion: "7.50.0" },
        { packageName: "@sentry/node", actualVersion: "7.50.0" },
        { packageName: "@sentry/node", actualVersion: "7.60.0" },
        { packageName: "@sentry/types", actualVersion: "7.50.0" },
        { packageName: "@sentry/types", actualVersion: "7.60.0" },
        { packageName: "@sentry/utils", actualVersion: "7.50.0" },
        { packageName: "@sentry/utils", actualVersion: "7.60.0" },
        { packageName: "@sentry/utils", actualVersion: "7.60.0" },
      ]);
    });
  });
});
