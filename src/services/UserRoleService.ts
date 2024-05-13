import api from "./api";
import { AxiosResponse } from "axios";

import UserRole from "../models/UserRole";

class UserRoleService {
  private baseURI: string = "/user_role";

  index(params?: object): Promise<AxiosResponse<UserRole[]>> {
    return api.get<UserRole[]>(`${this.baseURI}`, { params });
  }

  show(id: number): Promise<AxiosResponse<UserRole>> {
    return api.get<UserRole>(`${this.baseURI}/${id}`);
  }
}

export default new UserRoleService();
