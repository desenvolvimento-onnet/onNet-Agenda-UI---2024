import api from "./api";
import { AxiosResponse } from "axios";

import RolePermission from "../models/RolePermission";

class RolePermissionService {
  private baseURI: string = "/role_permission";

  index(params?: object): Promise<AxiosResponse<RolePermission[]>> {
    return api.get<RolePermission[]>(`${this.baseURI}`, { params });
  }

  show(id: number): Promise<AxiosResponse<RolePermission>> {
    return api.get<RolePermission>(`${this.baseURI}/${id}`);
  }
}

export default new RolePermissionService();
