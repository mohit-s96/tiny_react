import React from "../../../src";

const TodoItem = ({ value, remove }: { value: string; remove: any }) => {
  return (
    <p style={{ display: "flex", justifyContent: "space-between" }}>
      <span>{value}</span>
      <span
        style={{
          width: "25px",
          height: "25px",
          color: "#000",
          backgroundColor: "#fff",
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          fontSize: "12px",
        }}
        onClick={remove}
      >
        X
      </span>
    </p>
  );
};

const App = () => {
  const [todos, setTodos] = React.useState<string[]>([]);
  const [val, setVal] = React.useState("");
  function addTodo() {
    if (val.length > 0) {
      if (todos.indexOf(val) > -1) {
        alert("duplicate todo");
        return;
      }
      setTodos([...todos, val]);
      setVal("");
    } else {
      alert("empty todo");
    }
  }
  function remove(str: string) {
    let newTodos = todos.filter((x) => x !== str);
    setTodos(newTodos);
  }
  return (
    <div className="todo">
      <h1>To-Do List</h1>
      <div className="list-form">
        <label htmlFor="inp">add todos:</label>
        <input
          placeholder="todo"
          type="text"
          name="inp"
          value={val}
          onChange={(e) => setVal(e.target.value)}
        />
        <button onClick={addTodo}>add todo</button>
      </div>
      <div className="list">
        {todos.length ? (
          todos.map((x) => <TodoItem value={x} remove={() => remove(x)} />)
        ) : (
          <p>No todos created yet</p>
        )}
      </div>
    </div>
  );
};

export default App;
