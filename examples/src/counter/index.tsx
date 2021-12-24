import React from "../../../src";

const App = () => {
  const [count, setCount] = React.useState(0);
  return <button onClick={() => setCount(count + 1)}>Click me: {count}</button>;
};
export default App;
