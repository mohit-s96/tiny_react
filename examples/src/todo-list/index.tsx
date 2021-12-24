import React from "../../../src";

const TodoItem = ({ value }: { value: string }) => {
  return <p style={{ border: "1px solid red" }}>{value}</p>;
};

const App = () => {
  const [todos, setTodos] = React.useState<string[]>([]);
  const [val, setVal] = React.useState("");
  function addTodo() {
    if (val.length > 0) {
      setTodos([...todos, val]);
      setVal("");
    } else {
      alert("empty todo");
    }
  }
  return (
    <div>
      <div>
        <label htmlFor="inp">add todos:</label>
        <input
          type="text"
          name="inp"
          value={val}
          onChange={(e) => setVal(e.target.value)}
        />
        <button onClick={addTodo}>add todo</button>
      </div>
      <div>
        {todos.length ? (
          todos.map((x) => <TodoItem value={x} />)
        ) : (
          <p>No todos created yet</p>
        )}
      </div>
    </div>
  );
};

export default App;
