import React, { useMemo } from "react";
import DateFnsUtils from "@date-io/date-fns";

import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { ptBR } from "date-fns/locale";
import { Container, Main, Content } from "./styles";
import { useHistory } from "react-router";

import { ROUTES, AdminRoute } from "../layout.routes";

import DialogOsProvider from "../../components/Dialogs/OrderDialogs/context";
import DialogNumberProvider from "../../components/Dialogs/PhoneNumberDialogs/context";
import Navbar, { NavbarProps } from "./Navbar";
import Sidebar from "./Sidebar";
import DialogContractProvider from "../../components/Dialogs/ContractDialogs/context";

const AdminLayout: React.FC = ({ children }) => {
  const { location } = useHistory();

  function findRouteProps(
    routes: AdminRoute[],
    path: string,
    parent_name?: string,
    parent_background?: string
  ) {
    var props: NavbarProps = {};

    parent_name = parent_name ? `${parent_name} > ` : "";

    for (let i = 0; i < routes.length; i++) {
      const { children } = routes[i];

      if (routes[i].path === path) {
        props.title = parent_name + routes[i].name;
        props.background = routes[i].background || parent_background;
      } else if (children?.length)
        props = findRouteProps(
          children,
          path,
          routes[i].name,
          routes[i].background
        );

      if (props.title) break;
    }

    return props;
  }

  const currentRoute = useMemo(() => {
    const path = location.pathname.split("/");
    const index = path.length - 1;

    return findRouteProps(ROUTES, `/${path[index]}`);
  }, [location.pathname]);

  return (
    <Container>
      <Sidebar />

      <Main>
        <Navbar
          title={currentRoute.title}
          background={currentRoute.background}
        />

        <Content>
          <MuiPickersUtilsProvider utils={DateFnsUtils} locale={ptBR}>
            <DialogNumberProvider>
              <DialogContractProvider>
                <DialogOsProvider>{children}</DialogOsProvider>
              </DialogContractProvider>
            </DialogNumberProvider>
          </MuiPickersUtilsProvider>
        </Content>
      </Main>
    </Container>
  );
};

export default AdminLayout;
