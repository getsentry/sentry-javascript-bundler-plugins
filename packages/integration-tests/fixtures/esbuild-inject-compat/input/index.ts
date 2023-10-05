// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore just a test file
const FOO = process.env.FOO ? "injected value" : "injected fallback";

// eslint-disable-next-line no-console
console.log(FOO);
