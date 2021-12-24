import React from "../../src/index";
import "./style.css";

// import examples

import Counter from "./counter/index";
import Input from "./controlled-input/index";
import Todo from "./todo-list/index";

// this one uses custom hooks
import Async from "./async/index";

function render(App: any) {
  React.render(<App />, document.getElementById("app"));
}

render(Async);

function renderController() {
  const arr = [];
  ["counter", "inp", "todo", "async"].forEach((id) => {
    const elem = document.getElementById(id);
    arr.push(elem);
    elem.addEventListener("change", (e) => {
      let target = e.target as any;
      if (!target.checked) {
        target.checked = true;
      } else {
        switch (target.id) {
          case "counter":
            render(Counter);
            break;
          case "inp":
            render(Input);
            break;
          case "todo":
            render(Todo);
            break;
          case "async":
            render(Async);
          default:
            break;
        }
        arr.forEach((x) => {
          if (x !== target) {
            if (x.checked) {
              x.checked = false;
            }
          }
        });
      }
    });
  });
}
renderController();
