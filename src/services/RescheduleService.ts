import api from "./api";
import { AxiosResponse } from "axios";

import Reschedule from "../models/Reschedule";

class RescheduleService {
  private baseURI: string = "/reschedule";

  index(params?: object): Promise<AxiosResponse<Reschedule[]>> {
    return api.get<Reschedule[]>(`${this.baseURI}`, { params });
  }

  store(data: Reschedule): Promise<AxiosResponse<Reschedule>> {
    return api.post<Reschedule>(this.baseURI, data);
  }

  show(id: number): Promise<AxiosResponse<Reschedule>> {
    return api.get<Reschedule>(`${this.baseURI}/${id}`);
  }
}

export default new RescheduleService();
