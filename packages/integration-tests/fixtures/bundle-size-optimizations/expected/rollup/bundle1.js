function run() {
  const a = Math.random();
  {
    const myNum = 1;
    console.log("skip iframe", myNum);
  }

  return a;
}

console.log(run());
