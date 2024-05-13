import api from "./api";
import { AxiosResponse } from "axios";

import User from "../models/User";
import Pagination from "../models/Pagination";

class UserService {
  private baseURI: string = "/user";

  index(params?: object): Promise<AxiosResponse<Pagination<User>>> {
    return api.get<Pagination<User>>(`${this.baseURI}`, { params });
  }

  store(data: User): Promise<AxiosResponse<User>> {
    return api.post<User>(this.baseURI, data);
  }

  show(id: number): Promise<AxiosResponse<User>> {
    return api.get<User>(`${this.baseURI}/${id}`);
  }

  update(id: number, data: User): Promise<AxiosResponse<User>> {
    return api.put<User>(`${this.baseURI}/${id}`, data);
  }

  changePassword(password: string): Promise<AxiosResponse<void>> {
    return api.put<void>(`${this.baseURI}/change/passwd`, { password });
  }
}

export default new UserService();
