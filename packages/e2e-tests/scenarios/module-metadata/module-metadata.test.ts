import * as path from "path";
import { execSync } from "child_process";

import { MODULE_META_BUNDLERS } from "../../utils/bundlers";

describe("Module metadata injection", () => {
  it.each(MODULE_META_BUNDLERS)("Metadata is injected", (bundler) => {
    // Run the bundle and parse the JSON output
    const bundle = path.join(__dirname, "out", bundler, "index.js");
    const output = execSync(`node ${bundle}`).toString();
    const map = JSON.parse(output) as Record<string, string>;

    // There should be only one key in the map
    expect(Object.keys(map)).toHaveLength(1);

    // and that key should have the correct metadata
    for (const key in map) {
      expect(map[key]).toEqual({ team: "frontend" });
    }
  });
});
