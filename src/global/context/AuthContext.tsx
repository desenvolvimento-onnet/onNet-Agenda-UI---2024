import { AxiosError } from "axios";
import React, { createContext, useCallback, useEffect, useState } from "react";
import { notificate } from "../notificate";
import Permission from "../../models/Permission";
import Permissions from "../../models/Permissions";
import User from "../../models/User";
import api from "../../services/api";
import AuthService from "../../services/AuthService";
import PermissionService from "../../services/PermissionService";

interface LoginOptions {
  rememberEmail?: boolean;
}

interface AuthContextProps {
  user?: User;
  authenticated?: boolean;
  userPermissions?: Permissions;
  login: (
    email: string,
    password: string,
    options?: LoginOptions
  ) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps>(
  {} as AuthContextProps
);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User>();
  const [authenticated, setAuthenticated] = useState<boolean>();
  const [userPermissions, setUserPermissions] = useState<Permissions>();

  const getUserPermissions = useCallback((indexes: string[]) => {
    const userPermissions: Permissions = {
      order: {
        schedule: {},
      },
      schedule: { shift: {}, calendar: {} },
      orders: {},
      holidays: {},
      settings: {
        users: {},
        shifts: {},
        cities: {},
        shift_types: {},
        tecnologies: {},
        roles: {},
        compositions: {},
        contract_types: {},
        plans: {},
        products: {},
        taxes: {},
      },
      contract: {
        fix: {},
        import: {},
        products: {},
        renew: {},
      },
      contracts: {},
      import_contract: {},
      phone_number: {
        add: {},
        bind: {},
      },
      phone_numbers: {},
      telephony: {},
    };

    indexes.forEach((index) => eval(`userPermissions.${index} = true`));

    return userPermissions;
  }, []);

  const getParentPrefix = useCallback(
    (
      allPermissions: Permission[],
      parentId: number | null,
      childrenPrefix: string
    ): string => {
      const parent = allPermissions.find(
        (permission) => permission.id == parentId
      );

      if (!parent) return childrenPrefix;

      const parentPrefix = getParentPrefix(
        allPermissions,
        parent.parent_permission_id as number,
        parent.prefix
      );

      return `${parentPrefix}.${childrenPrefix}`;
    },
    []
  );

  const parsePermissions = useCallback(
    async (permissions: Permission[]) => {
      const allPermissions = (await PermissionService.index()).data;

      return permissions.map(({ prefix, parent_permission_id }) =>
        getParentPrefix(allPermissions, parent_permission_id as number, prefix)
      );
    },
    [getParentPrefix]
  );

  const refreshData = useCallback(
    async (token: string) => {
      api.defaults.headers.Authorization = `Bearer ${token}`;

      const { user, cities, ...data } = (await AuthService.refreshData()).data;

      user.cities = cities;

      const parsedPermissions = await parsePermissions(
        data.permissions.filter(({ isModule }) => !isModule)
      );

      const permissions = getUserPermissions(parsedPermissions);

      return { user, permissions };
    },
    [getUserPermissions]
  );

  const login = useCallback(
    async (email, password, options?: LoginOptions) => {
      const { auth, user, cities, permissions } = (
        await AuthService.authenticate(email, password)
      ).data;

      user.cities = cities;

      api.defaults.headers.Authorization = `Bearer ${auth.token}`;

      const parsedPermissions = await parsePermissions(
        permissions.filter(({ isModule }) => !isModule)
      );
      const userPermissions = getUserPermissions(parsedPermissions);

      sessionStorage.setItem("user", JSON.stringify(user));
      sessionStorage.setItem("permissions", JSON.stringify(parsedPermissions));
      sessionStorage.setItem("token", auth.token);

      if (options?.rememberEmail) localStorage.setItem("email", user.email);
      else localStorage.removeItem("email");

      setUser(user);
      setUserPermissions(userPermissions);
      setAuthenticated(true);
    },
    [
      setUser,
      setUserPermissions,
      setAuthenticated,
      parsePermissions,
      getUserPermissions,
    ]
  );

  const logout = useCallback(() => {
    api.defaults.headers.Autorization = undefined;

    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");

    setUser(undefined);
    setUserPermissions(undefined);
    setAuthenticated(false);
  }, [setUser, setUserPermissions, setAuthenticated]);

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (token)
      refreshData(token)
        .then((response) => {
          setUser(response.user);
          setUserPermissions(response.permissions);

          setAuthenticated(true);
        })
        .catch((err) => {
          notificate({
            title: "Aviso",
            message: "Você foi desconectado(a)!",
            type: "warning",
          });

          console.log(err);

          setUser(undefined);
          setUserPermissions(undefined);
          setAuthenticated(false);
        });
    else {
      setUser(undefined);
      setUserPermissions(undefined);
      setAuthenticated(false);
    }
  }, [refreshData, setUser, setUserPermissions, setAuthenticated]);

  useEffect(() => {
    api.interceptors.response.use(
      (response) => response,
      (err: AxiosError) => {
        if (err.response?.status == 403) {
          logout();

          notificate({
            title: "Aviso",
            message: "Você foi desconectado(a)",
            type: "info",
          });
        }

        return Promise.reject(err);
      }
    );
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        authenticated,
        login,
        logout,
        userPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
