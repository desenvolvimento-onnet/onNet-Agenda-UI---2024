import api from "./api";
import { AxiosResponse } from "axios";

import Holiday from "../models/Holiday";

class HolidayService {
  private baseURI: string = "/holiday";

  index(params?: object): Promise<AxiosResponse<Holiday[]>> {
    return api.get<Holiday[]>(`${this.baseURI}`, { params });
  }

  store(data: Holiday): Promise<AxiosResponse<Holiday>> {
    return api.post<Holiday>(this.baseURI, data);
  }

  show(id: number): Promise<AxiosResponse<Holiday>> {
    return api.get<Holiday>(`${this.baseURI}/${id}`);
  }

  update(id: number, data: Holiday): Promise<AxiosResponse<Holiday>> {
    return api.put<Holiday>(`${this.baseURI}/${id}`, data);
  }

  delete(id: number): Promise<AxiosResponse<void>> {
    return api.delete<void>(`${this.baseURI}/${id}`);
  }

  activeHolidays(params?: object): Promise<AxiosResponse<Holiday[]>> {
    return api.get<Holiday[]>(`${this.baseURI}/get/next_holidays`, { params });
  }
}

export default new HolidayService();
