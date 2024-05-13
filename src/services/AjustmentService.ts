import api from "./api";
import { AxiosResponse } from "axios";

import Ajustment from "../models/Ajustment";

class AjustmentService {
  private baseURI: string = "/ajustment";

  update(id: number, data: Ajustment): Promise<AxiosResponse<Ajustment>> {
    return api.put<Ajustment>(`${this.baseURI}/${id}`, data);
  }

  getMainAjustment(): Promise<AxiosResponse<Ajustment>> {
    return api.get<Ajustment>(`${this.baseURI}/find/main`);
  }
}

export default new AjustmentService();
