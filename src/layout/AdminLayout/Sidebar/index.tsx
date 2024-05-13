import React, { useCallback, useContext, useEffect, useState } from "react";

import { Container, CloseMenu, NavIcon, LinkHome, Content } from "./styles";

import { ROUTES } from "../../layout.routes";

import RouteList from "./RouteList";

import AgendaLogo from "../../../assets/agenda-logo.svg";
import AgendaLogoFull from "../../../assets/agenda-logo-full.svg";
import { AuthContext } from "../../../global/context/AuthContext";

const Sidebar: React.FC = () => {
  const { userPermissions } = useContext(AuthContext);

  const [isOpened, setIsOpened] = useState(false);

  useEffect(() => {
    const storage = localStorage.getItem("sidebar") === "opened";

    setIsOpened(storage);
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar", isOpened ? "opened" : "closed");
  }, [isOpened]);

  const handleCloseMenu = useCallback(() => {
    setIsOpened((prev) => !prev);
  }, []);

  return (
    <Container className={isOpened ? "active" : ""}>
      <CloseMenu onClick={handleCloseMenu}>
        <NavIcon className={isOpened ? "close" : ""} />
      </CloseMenu>

      <Content>
        <LinkHome className={isOpened ? "opened" : ""} to="/">
          {isOpened ? (
            <img src={AgendaLogoFull} alt="Logo" />
          ) : (
            <img src={AgendaLogo} alt="Logo" />
          )}
        </LinkHome>
        
        <RouteList
          routes={ROUTES.filter(
            (route) =>
              userPermissions && eval(`userPermissions.${route.permission}`)
          )}
          short={!isOpened}
        />
      </Content>
    </Container>
  );
};

export default Sidebar;
