import api from "./api";
import { AxiosResponse } from "axios";

import ShiftCity from "../models/ShiftCity";

export interface FreeVacancies {
  date: Date | string;
  free: number;
  shiftCity: ShiftCity;
}

class ShiftCityService {
  private baseURI: string = "/shift_city";

  index(params?: object): Promise<AxiosResponse<ShiftCity[]>> {
    return api.get<ShiftCity[]>(`${this.baseURI}`, { params });
  }

  show(id: number): Promise<AxiosResponse<ShiftCity>> {
    return api.get<ShiftCity>(`${this.baseURI}/${id}`);
  }

  update(id: number, data: ShiftCity): Promise<AxiosResponse<ShiftCity>> {
    return api.put<ShiftCity>(`${this.baseURI}/${id}`, data);
  }

  updateCities(
    shiftId: number,
    shiftCities: ShiftCity[]
  ): Promise<AxiosResponse<ShiftCity>> {
    return api.put<ShiftCity>(`${this.baseURI}/update/${shiftId}`, {
      shiftCities,
    });
  }

  getByCityByDate(
    city_id: number,
    date: string,
    params?: object
  ): Promise<AxiosResponse<ShiftCity[]>> {
    return api.get<ShiftCity[]>(
      `${this.baseURI}/city/${city_id}/date/${date}`,
      { params }
    );
  }

  getFreeVacancies(id: number): Promise<AxiosResponse<FreeVacancies[]>> {
    return api.get<FreeVacancies[]>(`${this.baseURI}/freeVacancies/${id}`);
  }
}

export default new ShiftCityService();
