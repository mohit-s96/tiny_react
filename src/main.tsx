import "./style.css";
import { React } from "./index";
// import { App } from "./examples/counter/App";
// import { App } from "./examples/simple/App";

const app = document.querySelector<HTMLDivElement>("#app")!;
React.render(
  <div>
    hello world <p>okokok</p>
  </div>,
  app
);
