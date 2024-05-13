import api from "./api";
import { AxiosResponse } from "axios";

import Shift from "../models/Shift";

class ShiftService {
  private baseURI: string = "/shift";

  index(params?: object): Promise<AxiosResponse<Shift[]>> {
    return api.get<Shift[]>(`${this.baseURI}`, { params });
  }

  store(data: Shift): Promise<AxiosResponse<Shift>> {
    return api.post<Shift>(this.baseURI, data);
  }

  show(id: number): Promise<AxiosResponse<Shift>> {
    return api.get<Shift>(`${this.baseURI}/${id}`);
  }

  update(id: number, data: Shift): Promise<AxiosResponse<Shift>> {
    return api.put<Shift>(`${this.baseURI}/${id}`, data);
  }
}

export default new ShiftService();
