import fs from "fs";
import path from "path";

const scenarioPaths = fs
  .readdirSync(path.join(__dirname, "..", "scenarios"))
  .map((fixtureDir) => path.join(__dirname, "..", "scenarios", fixtureDir));

scenarioPaths.forEach((fixturePath) => {
  require(path.join(fixturePath, "setup.ts"));
});
