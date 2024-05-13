import api from "./api";
import { AxiosResponse } from "axios";

import Composition from "../models/Composition";
import CompositionItem from "../models/CompositionItem";

class CompositionService {
  private baseURI: string = "/composition";

  index(params?: object): Promise<AxiosResponse<Composition[]>> {
    return api.get<Composition[]>(`${this.baseURI}`, { params });
  }

  store(data: Composition): Promise<AxiosResponse<Composition>> {
    return api.post<Composition>(this.baseURI, data);
  }

  show(id: number): Promise<AxiosResponse<Composition>> {
    return api.get<Composition>(`${this.baseURI}/${id}`);
  }

  update(id: number, data: Composition): Promise<AxiosResponse<Composition>> {
    return api.put<Composition>(`${this.baseURI}/${id}`, data);
  }

  updateCompositionItems(
    contract_id: number,
    compositionItems: CompositionItem[],
    composition?: Composition
  ): Promise<AxiosResponse<Composition>> {
    return api.put<Composition>(`${this.baseURI}/update_items/${contract_id}`, {
      compositionItems,
      ...composition,
    });
  }
}

export default new CompositionService();
