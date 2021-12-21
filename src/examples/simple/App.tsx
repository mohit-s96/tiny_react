import { ReactProps } from "../../core/types";
import React from "../../index";

const arr = ["component from list", "another list component"];

function Hello({ message }: CustomProps) {
  return <div>{message}</div>;
}
interface CustomProps extends Partial<ReactProps> {
  message: string;
}
export function App() {
  const App = (
    <div>
      Hello World{" "}
      <span title="hello" style={{ color: "red", background: "#000" }}>
        Lorem ipsum dolor sit amet consectetur
      </span>{" "}
      ok
      <Hello message="nested component" />
      {arr.map((x) => (
        <p>{x}</p>
      ))}
    </div>
  );
  return App;
}
