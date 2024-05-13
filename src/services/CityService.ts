import api from "./api";
import { AxiosResponse } from "axios";

import City from "../models/City";

class CityService {
  private baseURI: string = "/city";

  index(params?: object): Promise<AxiosResponse<City[]>> {
    return api.get<City[]>(`${this.baseURI}`, { params });
  }

  store(data: City): Promise<AxiosResponse<City>> {
    return api.post<City>(this.baseURI, data);
  }

  show(id: number): Promise<AxiosResponse<City>> {
    return api.get<City>(`${this.baseURI}/${id}`);
  }

  update(id: number, data: City): Promise<AxiosResponse<City>> {
    return api.put<City>(`${this.baseURI}/${id}`, data);
  }
}

export default new CityService();
