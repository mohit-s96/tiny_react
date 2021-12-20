import "./style.css";
import React from "./index";
// import { App } from "./examples/counter/App";
// import { App } from "./examples/simple/App";

const app = document.querySelector<HTMLDivElement>("#app")!;

function rerender(num: number) {
  counter(num);
}

const Counter = ({ val }: { val: string | number }) => {
  return (
    <div>
      hello world <p>okokok</p>
      <button onClick={() => rerender(+val + 1)}>{val}</button>
    </div>
  );
};

const counter = (val: string | number) => {
  React.render(<Counter val={val} />, app);
};
rerender(0);
// React.render(<App />, app);
