import { ComponentA } from "./component-a";

function falseRender(component) {
  console.log(component);
}

falseRender(<ComponentA />);
