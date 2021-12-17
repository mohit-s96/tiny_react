import { React } from "../../index";
import { ReactProps } from "../../types";

interface ButtonProps extends Partial<ReactProps> {
  count: string;
  onclick: () => any;
}

const Button = ({ count, onclick }: ButtonProps) => {
  return <button onClick={onclick}>{count}</button>;
};

export const App = () => {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Button count="0" onclick={() => console.log("hello")} />
    </div>
  );
};
