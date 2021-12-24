import { FormEvent } from "react";
import React from "../../../src";

const App = () => {
  const [name, setName] = React.useState("");
  const [pass, setPass] = React.useState("");

  function validateFormAndSubmit(e: FormEvent) {
    e.preventDefault();
    if (name.length > 5 && pass.length > 8) {
      alert("All good");
      setName("");
      setPass("");
    } else {
      alert(
        "name should be greater than 5 and password greater than 8 characters"
      );
    }
  }

  return (
    <div className="form">
      <h1>Login</h1>
      <form onSubmit={validateFormAndSubmit}>
        <label htmlFor="name">Username</label>
        <input
          placeholder="username"
          type="text"
          name="name"
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
        <label htmlFor="pass">Password</label>
        <input
          placeholder="password"
          type="password"
          name="pass"
          onChange={(e) => setPass(e.target.value)}
          value={pass}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default App;
