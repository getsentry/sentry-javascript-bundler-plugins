import { Logger } from "../../src/sentry/logger";
import { findMismatchedEntries, warnForMismatchedEntries } from "../../src/sentry-packages/utils";

describe("sentry-packages > utils", () => {
  describe("findMismatchedEntries", () => {
    it("works without entries", () => {
      const actual = findMismatchedEntries([]);

      expect(actual).toEqual({});
    });

    it("works without mismatched entries", () => {
      const entries = [
        {
          packageName: "@sentry-internal/tracing",
          definedVersion: "7.50.0",
          actualVersion: "7.50.0",
        },
        {
          packageName: "@sentry/core",
          definedVersion: "7.51.0",
          actualVersion: "7.51.0",
        },
        {
          packageName: "@sentry/core",
          definedVersion: "^7.50.0",
          actualVersion: "7.51.0",
        },
      ];

      const actual = findMismatchedEntries(entries);

      expect(actual).toEqual({});
    });

    it("works with single mismatched entry", () => {
      const entries = [
        {
          packageName: "@sentry-internal/tracing",
          definedVersion: "7.50.0",
          actualVersion: "7.50.0",
        },
        {
          packageName: "@sentry-internal/tracing",
          definedVersion: "7.^49.0",
          actualVersion: "7.50.0",
        },
        {
          packageName: "@sentry/core",
          definedVersion: "7.51.0",
          actualVersion: "7.51.0",
        },
        {
          packageName: "@sentry/core",
          definedVersion: "^7.50.0",
          actualVersion: "7.50.0",
        },
      ];

      const actual = findMismatchedEntries(entries);

      expect(actual).toEqual({
        "@sentry/core": ["7.51.0", "7.50.0"],
      });
    });

    it("works with mismatched versions", () => {
      const entries = [
        {
          packageName: "@sentry-internal/tracing",
          definedVersion: "7.50.0",
          actualVersion: "7.50.0",
        },
        {
          packageName: "@sentry-internal/tracing",
          definedVersion: "7.60.0",
          actualVersion: "7.60.0",
        },
        {
          packageName: "@sentry/cli",
          definedVersion: "^2.21.2",
          actualVersion: "2.21.2",
        },
        {
          packageName: "@sentry/core",
          definedVersion: "7.50.0",
          actualVersion: "7.50.0",
        },
        {
          packageName: "@sentry/core",
          definedVersion: "7.60.0",
          actualVersion: "7.60.0",
        },
        {
          packageName: "@sentry/integrations",
          definedVersion: "7.50",
          actualVersion: "7.50.0",
        },
        {
          packageName: "@sentry/node",
          definedVersion: "7.50",
          actualVersion: "7.50.0",
        },
        {
          packageName: "@sentry/node",
          definedVersion: "^7.60.0",
          actualVersion: "7.60.0",
        },
        {
          packageName: "@sentry/types",
          definedVersion: "7.50.0",
          actualVersion: "7.50.0",
        },
        {
          packageName: "@sentry/types",
          definedVersion: "7.60.0",
          actualVersion: "7.60.0",
        },
        {
          packageName: "@sentry/utils",
          definedVersion: "7.50.0",
          actualVersion: "7.50.0",
        },
        {
          packageName: "@sentry/utils",
          definedVersion: "7.60.0",
          actualVersion: "7.60.0",
        },
        {
          packageName: "@sentry/utils",
          definedVersion: "^7.60.0",
          actualVersion: "7.60.0",
        },
        {
          packageName: "@sentry/utils",
          definedVersion: "^7.50.0",
          actualVersion: "7.60.0",
        },
      ];

      const actual = findMismatchedEntries(entries);

      expect(actual).toEqual({
        "@sentry-internal/tracing": ["7.50.0", "7.60.0"],
        "@sentry/core": ["7.50.0", "7.60.0"],
        "@sentry/node": ["7.50.0", "7.60.0"],
        "@sentry/types": ["7.50.0", "7.60.0"],
        "@sentry/utils": ["7.50.0", "7.60.0"],
      });
    });
  });

  describe("warnForMismatchedEntries", () => {
    it("works without mismatched entries", () => {
      const warn = jest.fn();

      const logger = {
        warn,
      } as unknown as Logger;

      warnForMismatchedEntries(logger, {});

      expect(warn).not.toHaveBeenCalled();
    });

    it("works with single mismatched entry", () => {
      const warn = jest.fn();

      const logger = {
        warn,
      } as unknown as Logger;

      const entries = {
        "@sentry/utils": ["7.55.0", "7.51.0", "7.52.0"],
      };

      warnForMismatchedEntries(logger, entries);

      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn)
        .toHaveBeenCalledWith(`Found mismatched installed versions for the following Sentry packages:
  @sentry/utils: 7.51.0, 7.52.0, 7.55.0

Only a single version of these packages should be installed.
Please make sure to update & align your dependencies accordingly, or you may experience unexpected behavior.`);
    });

    it("works with multiple mismatched entries", () => {
      const warn = jest.fn();

      const logger = {
        warn,
      } as unknown as Logger;

      const entries = {
        "@sentry/utils": ["7.55.0", "7.51.0", "7.52.0"],
        "@sentry/core": ["7.49.0", "7.50.0"],
      };

      warnForMismatchedEntries(logger, entries);

      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn)
        .toHaveBeenCalledWith(`Found mismatched installed versions for the following Sentry packages:
  @sentry/utils: 7.51.0, 7.52.0, 7.55.0
  @sentry/core: 7.49.0, 7.50.0

Only a single version of these packages should be installed.
Please make sure to update & align your dependencies accordingly, or you may experience unexpected behavior.`);
    });
  });
});
