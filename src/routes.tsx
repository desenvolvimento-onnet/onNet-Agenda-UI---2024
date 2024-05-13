import React from "react";

import { HashRouter, Redirect, Route, Switch } from "react-router-dom";

import Login from "./pages/Login";
import LayoutRoutes from "./layout/layout.routes";

const Routes: React.FC = () => {
  return (
    <HashRouter>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/" component={LayoutRoutes} />
      </Switch>
    </HashRouter>
  );
};

export default Routes;
