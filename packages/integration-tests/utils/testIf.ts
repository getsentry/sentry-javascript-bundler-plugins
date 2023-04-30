// eslint-disable-next-line no-undef
export function testIf(condition: boolean): jest.It {
  if (condition) {
    // eslint-disable-next-line no-undef
    return test;
  } else {
    // eslint-disable-next-line no-undef
    return test.skip;
  }
}

/**
 * Webpack 4 doesn't work for Node.js versions >= 18.
 * We can use this function to skip tests on Webpack 4.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, no-undef, @typescript-eslint/no-unsafe-assignment
export const testIfNodeMajorVersionIsLessThan18: jest.It = function () {
  const nodejsMajorversion = process.version.split(".")[0]?.slice(1);
  return testIf(!nodejsMajorversion || parseInt(nodejsMajorversion) < 18);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;
