import React, { useContext } from "react";

import { Redirect, Route, RouteProps } from "react-router-dom";
import { AuthContext } from "../../../global/context/AuthContext";

interface PrivateRouteProps extends RouteProps {
  permission: string;
  redirectTo?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  permission,
  redirectTo,
  ...props
}) => {
  const { authenticated, userPermissions } = useContext(AuthContext);

  if (authenticated === false) return <Redirect to={redirectTo || "/login"} />;
  if (authenticated === true && userPermissions) {
    if (!eval(`userPermissions.${permission}`))
      return <Redirect path={(props.path as string) || ""} to="/404" exact />;

    return <Route {...props} />;
  }

  return <></>;
};

export default PrivateRoute;
