export const fibonacci = (n) => {
  if (n === 3) {
    throw new Error("I'm an uncaught error");
  }
  if (n <= 1) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
};
