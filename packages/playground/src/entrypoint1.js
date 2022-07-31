import { getGlobal } from "./get-global";
import { helloWorld } from "./hello-world";
export { getGlobal } from "./get-global";

console.log("entrypoint1.js loaded");

export function main() {
  console.log("called main (entrypoint1.js)");
  helloWorld();
}

console.log("global:", getGlobal());
