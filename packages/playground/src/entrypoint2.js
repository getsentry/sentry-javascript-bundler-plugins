import { main as main1 } from "./entrypoint1";
export { getGlobal } from "./get-global";

console.log("entrypoint2.js loaded");

export function main() {
  console.log("called main (entrypoint2.js)");
  main1();
}

const asdf = () => {
  console.log("defualt called (entrypoint2.js)");
};

console.log("global:", getGlobal());
export { asdf as default };
