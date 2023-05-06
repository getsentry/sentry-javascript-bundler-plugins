import { pluginConfig } from "./config";
import { BUNDLERS } from "../../utils/bundlers";
import { getSentryReleaseFiles } from "../../utils/releases";

describe("Simple Sourcemaps Upload (one string include + default options)", () => {
  it.each(BUNDLERS)("uploads the correct files using %s", async (bundler) => {
    const release = `${pluginConfig.release?.name || ""}-${bundler}`;

    const sentryFiles = await getSentryReleaseFiles(release);

    expect(sentryFiles).toMatchSnapshot();
  });
});
