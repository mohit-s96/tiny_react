import "./style.css";
import { React } from "./index";
// import { App } from "./examples/counter/App";
import { App } from "./examples/simple/App";

const app = document.querySelector<HTMLDivElement>("#app")!;

// function rerender(num: number) {
//   counter(num);
// }

// const counter = (val: string | number) => {
//   const jsx = (
//     <div>
//       hello world <p>okokok</p>
//       <button onClick={() => rerender(+val + 1)}>{val}</button>
//     </div>
//   );
//   React.render(jsx, app);
// };
// rerender(0);
React.render(<App />, app);
