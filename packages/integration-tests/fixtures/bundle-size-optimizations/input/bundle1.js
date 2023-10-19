function run() {
  const a = Math.random();
  if (__SENTRY_DEBUG__ && a > 0.5) {
    console.log("a > 0.5");
  }
  if (__SENTRY_DEBUG__ && __RRWEB_EXCLUDE_CANVAS__) {
    console.log("debug & exclude");
  }
  if (__RRWEB_EXCLUDE_IFRAME__) {
    const myNum = __RRWEB_EXCLUDE_CANVAS__ ? 1 : 2;
    console.log("skip iframe", myNum);
  }

  return a;
}

console.log(run());
