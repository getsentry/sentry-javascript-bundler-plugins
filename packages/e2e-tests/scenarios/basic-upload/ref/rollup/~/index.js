'use strict';

var _global =
      typeof window !== 'undefined' ?
        window :
        typeof global !== 'undefined' ?
          global :
          typeof self !== 'undefined' ?
            self :
            {};

    _global.SENTRY_RELEASE={id:"basic-upload-rollup"};

const fibonacci = (n) => {
  if (n === 3) {
    throw new Error("I'm an uncaught error");
  }
  if (n <= 1) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
};

console.log("Hi, I'm a very simple app");

fibonacci(10);

console.log("I'm done");
//# sourceMappingURL=index.js.map
