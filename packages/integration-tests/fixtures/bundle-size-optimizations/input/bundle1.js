if (__SENTRY_DEBUG__ && Math.random() > 0.5) {
  console.log("was > 0.5");
}

if (__SENTRY_DEBUG__ && __RRWEB_EXCLUDE_CANVAS__) {
  console.log("debug & exclude");
}

console.log(__RRWEB_EXCLUDE_CANVAS__ ? 1 : 2);
