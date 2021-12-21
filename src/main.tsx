import "./style.css";
import React from "./index";
// import { App } from "./examples/counter/App";
// import { App } from "./examples/simple/App";

const app = document.querySelector<HTMLDivElement>("#app")!;

// function rerender(num: number) {
//   counter(num);
// }

const Counter = () => {
  console.log("counter 1 called");

  const [state, setState] = React.useState(0);
  const [val, setVal] = React.useState("");
  return (
    <div>
      hello world <p>okokok</p>
      <button onClick={() => setState(state + 1)}>{state}</button>
      <p>button clicked {state} times</p>
      <input
        type="text"
        value={val}
        onChange={(e) => {
          // setVal(e.target.value);
        }}
      />
    </div>
  );
};
const Counter2 = () => {
  console.log("counter 2 called");

  const [state, setState] = React.useState(0);
  return (
    <div>
      <button onClick={() => setState(state + 1)}>Counter 2 : {state}</button>
    </div>
  );
};
const App = () => (
  <div>
    <Counter />
    <Counter2 />
  </div>
);
// const counter = (val: string | number) => {
//   React.render(<Counter val={val} />, app);
// };
// rerender(0);
React.render(<App />, app);
