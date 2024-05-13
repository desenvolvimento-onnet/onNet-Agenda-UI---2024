import api from "./api";
import { AxiosResponse } from "axios";

import System, { Order, Contract } from "../models/System";

export interface SystemContractParams {
  client_number?: number | null;
  contract_number: number;
}

class SystemService {
  private baseURI: string = "/system";

  index(params?: object): Promise<AxiosResponse<System[]>> {
    return api.get<System[]>(`${this.baseURI}`, { params });
  }

  store(data: System): Promise<AxiosResponse<System>> {
    return api.post<System>(this.baseURI, data);
  }

  show(id: number): Promise<AxiosResponse<System>> {
    return api.get<System>(`${this.baseURI}/${id}`);
  }

  update(id: number, data: System): Promise<AxiosResponse<System>> {
    return api.put<System>(`${this.baseURI}/${id}`, data);
  }

  getSystemOs(os: number, system: System): Promise<AxiosResponse<Order>> {
    return api.get<Order>(`${this.baseURI}/${system.identifier}/os/${os}`);
  }

  getSystemContract(
    system: System,
    { contract_number, ...params }: SystemContractParams
  ): Promise<AxiosResponse<Contract>> {
    return api.get<Contract>(
      `${this.baseURI}/${system.identifier}/contract/${contract_number}`,
      { params }
    );
  }
}

export default new SystemService();
