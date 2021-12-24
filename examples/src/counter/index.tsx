import React from "../../../src";

const App = () => {
  const [count, setCount] = React.useState(0);
  return (
    <div className="counter">
      <button className="counter-btn" onClick={() => setCount(count + 1)}>
        Click me: {count}
      </button>
    </div>
  );
};
export default App;
