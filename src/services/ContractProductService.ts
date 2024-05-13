import api from "./api";
import { AxiosResponse } from "axios";

import ContractProduct from "../models/ContractProduct";

class ContractProductService {
  private baseURI: string = "/contract_product";

  index(params?: object): Promise<AxiosResponse<ContractProduct[]>> {
    return api.get<ContractProduct[]>(`${this.baseURI}`, { params });
  }

  show(id: number): Promise<AxiosResponse<ContractProduct>> {
    return api.get<ContractProduct>(`${this.baseURI}/${id}`);
  }

  update(
    id: number,
    data: ContractProduct
  ): Promise<AxiosResponse<ContractProduct>> {
    return api.put<ContractProduct>(`${this.baseURI}/${id}`, data);
  }

  updateProducts(
    contractId: number,
    contractProducts: ContractProduct[]
  ): Promise<AxiosResponse<ContractProduct>> {
    return api.put<ContractProduct>(`${this.baseURI}/update/${contractId}`, {
      contractProducts,
    });
  }
}

export default new ContractProductService();
