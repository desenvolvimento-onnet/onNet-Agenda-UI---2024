import api from "./api";
import { AxiosResponse } from "axios";

import Tecnology from "../models/Tecnology";

class TecnologyService {
  private baseURI: string = "/tecnology";

  index(params?: object): Promise<AxiosResponse<Tecnology[]>> {
    return api.get<Tecnology[]>(`${this.baseURI}`, { params });
  }

  store(data: Tecnology): Promise<AxiosResponse<Tecnology>> {
    return api.post<Tecnology>(this.baseURI, data);
  }

  show(id: number): Promise<AxiosResponse<Tecnology>> {
    return api.get<Tecnology>(`${this.baseURI}/${id}`);
  }

  update(id: number, data: Tecnology): Promise<AxiosResponse<Tecnology>> {
    return api.put<Tecnology>(`${this.baseURI}/${id}`, data);
  }
}

export default new TecnologyService();
