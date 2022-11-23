const bundlers = ["rollup", "vite", "esbuild", "webpack5"];

// Webpack 4 doesn't work with Node versions >= 17
const nodeMajorVersion = process.version.split(".")[0];
if (nodeMajorVersion && parseInt(nodeMajorVersion) <= 16) {
  bundlers.push("webpack4");
}

export const BUNDLERS = bundlers;
