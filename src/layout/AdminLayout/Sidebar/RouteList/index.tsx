import React, { HTMLAttributes, memo } from "react";
import { FiLogOut } from "react-icons/fi";
import { BiCard } from "react-icons/bi";
import { NavLink } from "react-router-dom";

import { AdminRoute } from "../../../layout.routes";

import { Container } from "./styles";
import Divider from "../../../../components/Divider";

interface RouteListProps extends HTMLAttributes<HTMLUListElement> {
  routes: AdminRoute[];
  short?: boolean;
}

const RouteList: React.FC<RouteListProps> = ({ routes, short, ...props }) => {
  return (
    <Container {...props}>
      {routes.map((route, i) => (
        <div key={route.path}>
          {i > 0 && route.categoryLevel !== routes[i - 1].categoryLevel && (
            <Divider />
          )}

          <NavLink
            key={route.path}
            title={route.name}
            to={route.path}
            activeClassName="active"
            className={short ? "short" : ""}
          >
            {route.icon}

            {!short && <span>{route.name}</span>}
          </NavLink>
        </div>
      ))}

      <Divider />

      <a
        title="Painel de O.S"
        href="http://177.85.0.28:4000/Desenvolvimento/Projects/Painel-OS/agenda-onnet.html"
        target="blank"
        className={short ? "short" : ""}
      >
        {<BiCard />}

        {!short && <span>Painel de O.S</span>}
      </a>

      <NavLink
        title="Sair"
        to="/login"
        className={`spaced ${short ? "short" : ""}`}
      >
        <FiLogOut />

        {!short && <span>Sair</span>}
      </NavLink>
    </Container>
  );
};

export default memo(RouteList);
