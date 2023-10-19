function run() {
  const obj = {
    debug: __SENTRY_DEBUG__ ? "a" : "b",
    trace: __SENTRY_TRACE__ ? "a" : "b",
    replayCanvas: __RRWEB_EXCLUDE_CANVAS__ ? "a" : "b",
    replayIframe: __RRWEB_EXCLUDE_IFRAME__ ? "a" : "b",
    replayShadowDom: __RRWEB_EXCLUDE_SHADOW_DOM__ ? "a" : "b",
  };

  return obj;
}

console.log(run());
