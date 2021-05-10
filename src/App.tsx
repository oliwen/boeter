import React from "react";
import {
  Switch,
  Route,
  BrowserRouter,
  Link,
  useLocation,
} from "react-router-dom";
import { Login } from "./Views/Login";
import { Start } from "./Views/Start";
import { AddPlayer } from "./Views/AddPlayer";
import "./App.css";
import { Players } from "./Views/Players";
import { Layout } from "antd";
import { Menu } from "antd";
import { appState } from "./appState";

const { Header, Content } = Layout;

const AppMenu = () => {
  const location = useLocation();
  const isAdmin = appState.user?.uid === "EgoOmqK9MwY346XFgNd5ojGC8e12";

  return (
    <Menu
      theme="dark"
      mode="horizontal"
      defaultSelectedKeys={["/"]}
      selectedKeys={[location.pathname]}
    >
      <Menu.Item key="/">
        <Link to="/">SUMMERING</Link>
      </Menu.Item>
      {isAdmin && (
        <>
          <Menu.Item key="/entry-add">
            <Link to="/entry-add">NYA BÖTER</Link>
          </Menu.Item>
          <Menu.Item key="/players-add">
            <Link to="/players-add">NY SPELARE</Link>
          </Menu.Item>
        </>
      )}
    </Menu>
  );
};

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Layout className="layout">
          <Header>
            <AppMenu />
          </Header>
          <Content style={{ padding: "20px" }}>
            <Switch>
              <Route path="/entry-add" exact component={Start} />
              <Route path="/players-add" component={AddPlayer} exact />
              <Route path="/" component={Players} exact />
              <Route path="/login" component={Login} />
            </Switch>
          </Content>
        </Layout>
      </div>
    </BrowserRouter>
  );
}

export default App;
