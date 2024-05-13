import React, { useCallback, useMemo } from "react";

import flattenChildren from "react-flatten-children";

import {
  FaBoxOpen,
  FaBuilding,
  FaFileContract,
  FaFileDownload,
  FaMoneyCheckAlt,
  FaUserFriends,
} from "react-icons/fa";
import {
  MdAssignmentTurnedIn,
  MdDialpad,
  MdNetworkCheck,
  MdPhone,
  MdSettings,
  MdSettingsSystemDaydream,
} from "react-icons/md";
import { IoMdCalendar, IoMdOptions } from "react-icons/io";
import { RiFileList2Fill, RiRouterFill } from "react-icons/ri";
import { IoNewspaperOutline } from "react-icons/io5";
import { AiFillFolderOpen } from "react-icons/ai";
import { GiPalmTree } from "react-icons/gi";
import { Redirect, Route, Switch as BaseSwitch } from "react-router-dom";
import { FiPercent } from "react-icons/fi";

import Holidays from "../pages/Holidays";
import Cities from "../pages/Settings/Cities";
import Orders from "../pages/Orders";
import Schedule from "../pages/Schedule";
import Settings from "../pages/Settings";
import Shifts from "../pages/Settings/Shifts";
import Users from "../pages/Settings/Users";
import AdminLayout from "./AdminLayout";
import ShiftTypes from "../pages/Settings/ShiftTypes";
import Tecnologies from "../pages/Settings/Tecnologies";
import NotFound from "../pages/NotFound";
import PrivateRoute from "./AdminLayout/PrivateRoute";
import Roles from "../pages/Settings/Roles";
import Contracts from "../pages/Contracts";
import ContractTypes from "../pages/Settings/ContractTypes";
import Products from "../pages/Settings/Products";
import PhoneNumbers from "../pages/PhoneNumbers";
import Telephony from "../pages/Telephony";
import ContractImport from "../pages/ContractImport";
import Plans from "../pages/Settings/Plans";
import ContractTypeShow from "../pages/Settings/ContractTypes/ContractTypeShow";
import InstallationTaxes from "../pages/Settings/InstallationTaxes";
import Compositions from "../pages/Settings/Compositions";
import Systems from "../pages/Settings/Systems";

export interface AdminRoute {
  name: string;
  path: string;
  icon: React.ReactNode;
  component: React.FC;
  categoryLevel?: number;
  background?: string;
  permission: string;
  children?: AdminRoute[];
}

export const ROUTES: AdminRoute[] = [
  {
    name: "Agenda",
    path: "/schedule",
    icon: <IoMdCalendar />,
    component: Schedule,
    permission: "schedule.show",
    categoryLevel: 1,
    children: [],
  },
  {
    name: "O.S Lista",
    path: "/orders",
    icon: <IoNewspaperOutline />,
    component: Orders,
    permission: "orders.show",
    categoryLevel: 1,
    children: [],
  },
  {
    name: "Importação",
    path: "/import_contract",
    icon: <FaFileDownload />,
    component: ContractImport,
    permission: "import_contract.show",
    categoryLevel: 2,
    background: "var(--linear-tertiary)",
    children: [],
  },
  {
    name: "Contratos Lista",
    path: "/contracts",
    icon: <FaFileContract />,
    component: Contracts,
    permission: "contracts.show",
    categoryLevel: 2,
    background: "var(--linear-tertiary)",
    children: [],
  },
  {
    name: "Telefonia",
    path: "/telephony",
    icon: <MdDialpad />,
    component: Telephony,
    permission: "telephony.show",
    categoryLevel: 3,
    background: "var(--linear-quaternary)",
    children: [],
  },
  {
    name: "Números Lista",
    path: "/phone_numbers",
    icon: <MdPhone />,
    component: PhoneNumbers,
    permission: "phone_numbers.show",
    categoryLevel: 3,
    background: "var(--linear-quaternary)",
    children: [],
  },
  {
    name: "Feriados",
    path: "/holidays",
    icon: <GiPalmTree />,
    component: Holidays,
    permission: "holidays.show",
    categoryLevel: 4,
    children: [],
  },
  {
    name: "Configurações",
    path: "/settings",
    icon: <MdSettings />,
    component: Settings,
    permission: "settings.show",
    categoryLevel: 4,
    children: [
      {
        name: "Usuários",
        path: "/users",
        icon: <FaUserFriends />,
        component: Users,
        permission: "settings.users.show",
      },
      {
        name: "Turnos",
        path: "/shifts",
        icon: <MdAssignmentTurnedIn />,
        component: Shifts,
        permission: "settings.shifts.show",
      },
      {
        name: "Planos",
        path: "/plans",
        icon: <MdNetworkCheck />,
        component: Plans,
        permission: "settings.plans.show",
        children: [],
      },
      {
        name: "Composições fiscais",
        path: "/compositions",
        icon: <FiPercent />,
        component: Compositions,
        permission: "settings.compositions.show",
        children: [],
      },
      {
        name: "Sistemas",
        path: "/systems",
        icon: <MdSettingsSystemDaydream />,
        component: Systems,
        permission: "settings.compositions.show",
        children: [],
      },
      {
        name: "Cidades",
        path: "/cities",
        icon: <FaBuilding />,
        component: Cities,
        permission: "settings.cities.show",
      },
      {
        name: "Tipos de turno",
        path: "/shift_types",
        icon: <IoMdOptions />,
        component: ShiftTypes,
        permission: "settings.shift_types.show",
      },
      {
        name: "Tipos de contrato",
        path: "/contract_types",
        icon: <RiFileList2Fill />,
        component: ContractTypes,
        permission: "settings.contract_types.show",
        children: [
          {
            name: "Tipo de contrato",
            path: "/:id",
            icon: <RiFileList2Fill />,
            component: ContractTypeShow,
            permission: "settings.contract_types.show",
          },
        ],
      },
      {
        name: "Produtos",
        path: "/products",
        icon: <FaBoxOpen />,
        component: Products,
        permission: "settings.products.show",
      },
      {
        name: "Taxas de instalação",
        path: "/installation_taxes",
        icon: <FaMoneyCheckAlt />,
        component: InstallationTaxes,
        permission: "settings.taxes.show",
      },
      {
        name: "Tecnologias",
        path: "/tecnologies",
        icon: <RiRouterFill />,
        component: Tecnologies,
        permission: "settings.tecnologies.show",
      },
      {
        name: "Grupos de permissão",
        path: "/roles",
        icon: <AiFillFolderOpen />,
        component: Roles,
        permission: "settings.roles.show",
      },
    ],
  },
];

const Switch: React.FC = ({ children }) => {
  return <BaseSwitch>{flattenChildren(children)}</BaseSwitch>;
};

const LayoutRoutes: React.FC = () => {
  const getChildrenRoutes = useCallback(
    (children: AdminRoute[], parentPath?: string) => {
      var data: AdminRoute[] = [];

      children.forEach((route) => {
        const path = parentPath + route.path;

        data.push({ ...route, path });

        if (route.children?.length)
          data = data.concat(getChildrenRoutes(route.children, path));
      });

      return data;
    },
    []
  );

  const routes = useMemo(() => {
    return getChildrenRoutes(ROUTES, "");
  }, [getChildrenRoutes]);

  return (
    <AdminLayout>
      <Switch>
        {routes.map(({ path, component, permission }) => (
          <PrivateRoute
            key={path}
            path={path}
            component={component}
            permission={permission}
            redirectTo="/login"
            exact
          />
        ))}

        <Route path="/404" component={NotFound} exact />

        <Redirect path="/" to={routes[0].path || "/404"} exact />
        <Redirect to="/404" />
      </Switch>
    </AdminLayout>
  );
};

export default LayoutRoutes;
