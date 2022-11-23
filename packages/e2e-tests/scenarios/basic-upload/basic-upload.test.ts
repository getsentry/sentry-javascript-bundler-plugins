import { pluginConfig } from "./config";
import { BUNDLERS } from "../../utils/bundlers";
import { getSentryReleaseFiles } from "../../utils/releases";

describe("Simple Sourcemaps Upload (one string include + default options)", () => {
  it.each(BUNDLERS)("uploads the correct files using %s", async (bundler) => {
    const release = `${pluginConfig.release || ""}-${bundler}`;

    const sentryFiles = await getSentryReleaseFiles(release);

    // We replace Windows newlines with Unix newlines so we can run this test on windows CI
    const osNormalizedSentryFiles = sentryFiles.map((sentryFile) => {
      const copiedSentryFile = { ...sentryFile };
      copiedSentryFile.content = sentryFile.content.replace("\r\n", "\n");
      return copiedSentryFile;
    });

    expect(osNormalizedSentryFiles).toMatchSnapshot();
  });
});
