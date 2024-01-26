import { renderToString } from "react-dom/server";
import { ComponentA } from "./component-a";

export default function App() {
  return <ComponentA />;
}

console.log(
  renderToString(
    <div>
      <App />
    </div>
  )
);
