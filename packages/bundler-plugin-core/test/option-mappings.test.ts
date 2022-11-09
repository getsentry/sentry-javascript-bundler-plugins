import { Options } from "../src";
import { normalizeUserOptions } from "../src/options-mapping";

describe("normalizeUserOptions()", () => {
  test("should return correct value for default input", () => {
    const userOptions: Options = {
      org: "my-org",
      project: "my-project",
      authToken: "my-auth-token",
      release: "my-release", // we have to define this even though it is an optional value because of auto discovery
      include: "./out",
    };

    expect(normalizeUserOptions(userOptions)).toEqual({
      authToken: "my-auth-token",
      cleanArtifacts: false,
      debug: false,
      dryRun: false,
      finalize: true,
      include: [
        {
          ext: [".js", ".map", ".jsbundle", ".bundle"],
          ignore: ["node_modules"],
          paths: ["./out"],
          rewrite: true,
          sourceMapReference: true,
          stripCommonPrefix: false,
        },
      ],
      org: "my-org",
      project: "my-project",
      release: "my-release",
      silent: false,
      telemetry: true,
      url: "https://sentry.io/",
      validate: false,
      vcsRemote: "origin",
    });
  });

  test("should hoist top-level include options into include entries", () => {
    const userOptions: Options = {
      org: "my-org",
      project: "my-project",
      authToken: "my-auth-token",
      release: "my-release", // we have to define this even though it is an optional value because of auto discovery

      // include options
      include: [{ paths: ["./output", "./files"], ignore: ["./files"] }],
      rewrite: true,
      sourceMapReference: false,
      stripCommonPrefix: true,
      // It is intentional that only foo has a `.`. We're expecting all extensions to be prefixed with a dot.
      ext: ["js", "map", ".foo"],
    };

    expect(normalizeUserOptions(userOptions)).toEqual({
      authToken: "my-auth-token",
      cleanArtifacts: false,
      debug: false,
      dryRun: false,
      finalize: true,
      include: [
        {
          ext: [".js", ".map", ".foo"],
          ignore: ["./files"],
          paths: ["./output", "./files"],
          rewrite: true,
          sourceMapReference: false,
          stripCommonPrefix: true,
        },
      ],
      org: "my-org",
      project: "my-project",
      release: "my-release",
      silent: false,
      telemetry: true,
      url: "https://sentry.io/",
      validate: false,
      vcsRemote: "origin",
    });
  });
});
