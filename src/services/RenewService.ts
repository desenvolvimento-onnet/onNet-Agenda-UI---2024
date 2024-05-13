import api from "./api";
import { AxiosResponse } from "axios";

import Renew from "../models/Renew";
import Contract from "../models/Contract";

class RescheduleService {
  private baseURI: string = "/renew";

  index(params?: object): Promise<AxiosResponse<Renew[]>> {
    return api.get<Renew[]>(`${this.baseURI}`, { params });
  }

  store(data: Renew, fixedContract: Contract): Promise<AxiosResponse<Renew>> {
    return api.post<Renew>(this.baseURI, { ...data, fixedContract });
  }

  show(id: number): Promise<AxiosResponse<Renew>> {
    return api.get<Renew>(`${this.baseURI}/${id}`);
  }

  delete(id: number): Promise<AxiosResponse<void>> {
    return api.delete<void>(`${this.baseURI}/${id}`);
  }
}

export default new RescheduleService();
