console.log(
  (function () {
    const e = Math.random();
    {
      const e = 1;
      console.log("skip iframe", e);
    }
    return e;
  })()
);
