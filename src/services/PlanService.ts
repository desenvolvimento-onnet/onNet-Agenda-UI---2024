import api from "./api";
import { AxiosResponse } from "axios";

import Plan from "../models/Plan";
import Pagination from "../models/Pagination";

class PlanService {
  private baseURI: string = "/plan";

  index(params?: object): Promise<AxiosResponse<Pagination<Plan>>> {
    return api.get<Pagination<Plan>>(`${this.baseURI}`, { params });
  }

  store(data: Plan): Promise<AxiosResponse<Plan>> {
    return api.post<Plan>(this.baseURI, data);
  }

  show(id: number): Promise<AxiosResponse<Plan>> {
    return api.get<Plan>(`${this.baseURI}/${id}`);
  }

  update(id: number, data: Plan): Promise<AxiosResponse<Plan>> {
    return api.put<Plan>(`${this.baseURI}/${id}`, data);
  }
}

export default new PlanService();
