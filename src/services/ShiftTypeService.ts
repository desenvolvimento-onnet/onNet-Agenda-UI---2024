import api from "./api";
import { AxiosResponse } from "axios";

import ShiftType from "../models/ShiftType";

class ShiftTypeService {
  private baseURI: string = "/shift_type";

  index(params?: object): Promise<AxiosResponse<ShiftType[]>> {
    return api.get<ShiftType[]>(`${this.baseURI}`, { params });
  }

  store(data: ShiftType): Promise<AxiosResponse<ShiftType>> {
    return api.post<ShiftType>(this.baseURI, data);
  }

  show(id: number): Promise<AxiosResponse<ShiftType>> {
    return api.get<ShiftType>(`${this.baseURI}/${id}`);
  }

  update(id: number, data: ShiftType): Promise<AxiosResponse<ShiftType>> {
    return api.put<ShiftType>(`${this.baseURI}/${id}`, data);
  }
}

export default new ShiftTypeService();
