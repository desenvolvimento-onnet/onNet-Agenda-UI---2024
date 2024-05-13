import api from "./api";
import { AxiosResponse } from "axios";

import Contract from "../models/Contract";
import Pagination from "../models/Pagination";

export type ContractStatus = "new" | "renewal" | "fidelity_out" | "canceled";

export interface ContractFilterProps
  extends Omit<Contract, "users" | "cities"> {
  search_type: "contract" | "accession" | "conclusion" | "renewal";
  query?: string;
  statuses?: ContractStatus[];
  begin_date?: Date | string | null;
  end_date?: Date | string | null;
  users?: number[];
  cities?: number[];
  contract_types?: number[];
  client_name?: string;
}

class ContractService {
  private baseURI: string = "/contract";

  index(params?: object): Promise<AxiosResponse<Pagination<Contract>>> {
    return api.get<Pagination<Contract>>(`${this.baseURI}`, { params });
  }

  store(data: Contract): Promise<AxiosResponse<Contract>> {
    return api.post<Contract>(this.baseURI, data);
  }

  show(id: number): Promise<AxiosResponse<Contract>> {
    return api.get<Contract>(`${this.baseURI}/${id}`);
  }

  update(id: number, data: Contract): Promise<AxiosResponse<Contract>> {
    return api.put<Contract>(`${this.baseURI}/${id}`, data);
  }

  delete(id: number): Promise<AxiosResponse<void>> {
    return api.delete<void>(`${this.baseURI}/${id}`);
  }

  filter(
    data: ContractFilterProps,
    params?: object
  ): Promise<AxiosResponse<Pagination<Contract>>> {
    return api.post<Pagination<Contract>>(
      `${this.baseURI}/filter/query`,
      data,
      { params }
    );
  }
}

export default new ContractService();
