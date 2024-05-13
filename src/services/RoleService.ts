import api from "./api";
import { AxiosResponse } from "axios";

import Role from "../models/Role";

class RoleService {
  private baseURI: string = "/role";

  index(params?: object): Promise<AxiosResponse<Role[]>> {
    return api.get<Role[]>(`${this.baseURI}`, { params });
  }

  store(data: Role): Promise<AxiosResponse<Role>> {
    return api.post<Role>(this.baseURI, data);
  }

  show(id: number): Promise<AxiosResponse<Role>> {
    return api.get<Role>(`${this.baseURI}/${id}`);
  }

  update(id: number, data: Role): Promise<AxiosResponse<Role>> {
    return api.put<Role>(`${this.baseURI}/${id}`, data);
  }
}

export default new RoleService();
