import { getDebugIdPolyfillSnippet } from "../src";

describe("getDebugIdPolyfillSnippet", () => {
  it("returns the debugId injection snippet for a passed debugId", () => {
    const snippet = getDebugIdPolyfillSnippet("1234");
    expect(snippet).toMatchInlineSnapshot(
      `";{try{let e=\\"undefined\\"!=typeof window?window:\\"undefined\\"!=typeof global?global:\\"undefined\\"!=typeof globalThis?globalThis:\\"undefined\\"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]=\\"1234\\",e._sentryDebugIdIdentifier=\\"sentry-dbid-1234\\")}catch(e){}};"`
    );
  });
});
