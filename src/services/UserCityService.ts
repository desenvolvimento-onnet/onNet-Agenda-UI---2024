import api from "./api";
import { AxiosResponse } from "axios";

import UserCity from "../models/UserCity";

class UserCityService {
  private baseURI: string = "/user_city";

  index(params?: object): Promise<AxiosResponse<UserCity[]>> {
    return api.get<UserCity[]>(`${this.baseURI}`, { params });
  }

  show(id: number): Promise<AxiosResponse<UserCity>> {
    return api.get<UserCity>(`${this.baseURI}/${id}`);
  }
}

export default new UserCityService();
