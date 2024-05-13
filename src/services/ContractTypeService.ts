import api from "./api";
import { AxiosResponse } from "axios";

import ContractType from "../models/ContractType";

class ContractTypeService {
  private baseURI: string = "/contract_type";

  index(params?: object): Promise<AxiosResponse<ContractType[]>> {
    return api.get<ContractType[]>(`${this.baseURI}`, { params });
  }

  store(data: ContractType): Promise<AxiosResponse<ContractType>> {
    return api.post<ContractType>(this.baseURI, data);
  }

  show(id: number): Promise<AxiosResponse<ContractType>> {
    return api.get<ContractType>(`${this.baseURI}/${id}`);
  }

  update(id: number, data: ContractType): Promise<AxiosResponse<ContractType>> {
    return api.put<ContractType>(`${this.baseURI}/${id}`, data);
  }
}

export default new ContractTypeService();
