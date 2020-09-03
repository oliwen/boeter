import React from "react";
import { Switch, Route, BrowserRouter } from "react-router-dom";
import { Login } from "./Views/Login";
import { Start } from "./Views/Start";
import { AddPlayer } from "./Views/AddPlayer";
import "./App.css";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route path="/" exact component={Start} />
          <Route path="/players/add" component={AddPlayer} />
          <Route component={Login} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
