import React, { useMemo, useState } from "react";
import CardLink from "../../components/CardLink";

import { TextField } from "@material-ui/core";

import { ROUTES } from "../../layout/layout.routes";

import { Container, Header, Content } from "./styles";
import { padronize } from "../../global/globalFunctions";
import { useContext } from "react";
import { AuthContext } from "../../global/context/AuthContext";

const Settings: React.FC = () => {
  const { userPermissions } = useContext(AuthContext);

  const [query, setQuery] = useState<string>("");

  const routes = useMemo(() => {
    const value = padronize(query);

    const routes =
      ROUTES.find((route) => route.path === "/settings")?.children || [];

    routes.sort((a, b) => {
      if (a.name > b.name) return 1;

      if (a.name < b.name) return -1;

      return 0;
    });

    return routes.filter(
      (route) =>
        eval(`userPermissions?.${route.permission}`) &&
        (padronize(route.name).indexOf(value) > -1 ||
          padronize(route.path).indexOf(value) > -1)
    );
  }, [query, userPermissions]);

  return (
    <Container>
      <Header>
        <TextField
          label="Buscar"
          type="search"
          autoComplete="off"
          onChange={(ev) => setQuery(ev.target.value)}
        />
      </Header>

      <Content>
        {routes?.map((route) => (
          <CardLink
            key={route.path}
            to={`/settings${route.path}`}
            name={route.name}
            icon={route.icon}
          />
        ))}
      </Content>
    </Container>
  );
};

export default Settings;
