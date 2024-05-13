import api from "./api";
import { AxiosResponse } from "axios";

import Permission from "../models/Permission";

class PermissionService {
  private baseURI: string = "/permission";

  index(params?: object): Promise<AxiosResponse<Permission[]>> {
    return api.get<Permission[]>(`${this.baseURI}`, { params });
  }

  show(id: number): Promise<AxiosResponse<Permission>> {
    return api.get<Permission>(`${this.baseURI}/${id}`);
  }
}

export default new PermissionService();
