import api from "./api";
import { AxiosResponse } from "axios";

import InstallationTax from "../models/InstallationTax";

class InstallationTaxService {
  private baseURI: string = "/installation_tax";

  index(params?: object): Promise<AxiosResponse<InstallationTax[]>> {
    return api.get<InstallationTax[]>(`${this.baseURI}`, { params });
  }

  store(data: InstallationTax): Promise<AxiosResponse<InstallationTax>> {
    return api.post<InstallationTax>(this.baseURI, data);
  }

  show(id: number): Promise<AxiosResponse<InstallationTax>> {
    return api.get<InstallationTax>(`${this.baseURI}/${id}`);
  }

  update(
    id: number,
    data: InstallationTax
  ): Promise<AxiosResponse<InstallationTax>> {
    return api.put<InstallationTax>(`${this.baseURI}/${id}`, data);
  }
}

export default new InstallationTaxService();
