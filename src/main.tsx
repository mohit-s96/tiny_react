import "./style.css";
import React from "./index";
import { StateSetter } from "./core/types";
// import { App } from "./examples/counter/App";
// import { App } from "./examples/simple/App";

const app = document.querySelector<HTMLDivElement>("#app")!;

// function rerender(num: number) {
//   counter(num);
// }

const Counter = () => {
  // console.log("counter 1 called");

  const [state, setState] = React.useState(0);
  const [val, setVal] = React.useState("");

  React.useEffect(() => {
    console.log("ello from counter 1");
    return () => {
      console.log("unmounting...........bye");
    };
  }, [state, val]);

  return (
    <div>
      hello world <p>okokok</p>
      <button onClick={() => setState(state + 1)}>{state}</button>
      <p>button clicked {state} times</p>
      <input
        type="text"
        value={val}
        onChange={(e) => {
          setVal(e.target.value);
        }}
      />
    </div>
  );
};
const Counter2 = ({
  show,
  set,
}: {
  show: boolean;
  set: StateSetter<boolean>;
}) => {
  // console.log("counter 2 called");

  // const [state, setState] = React.useState(0);
  React.useEffect(() => {
    console.log("ola from counter 2");
  }, []);
  return (
    <div>
      <button onClick={() => set(!show)}>
        counter 1 is : {show ? "visible" : "hidden"}
      </button>
    </div>
  );
};
const App = () => {
  const [show, setShow] = React.useState(true);
  return (
    <div>
      {show ? <Counter /> : null}
      <Counter2 show={show} set={setShow} />
    </div>
  );
};
// const counter = (val: string | number) => {
//   React.render(<Counter val={val} />, app);
// };
// rerender(0);
React.render(<App />, app);
