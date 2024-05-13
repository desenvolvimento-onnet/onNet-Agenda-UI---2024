import api from "./api";
import { AxiosResponse } from "axios";

import CompositionItem from "../models/Composition";

class CompositionItemService {
  private baseURI: string = "/composition_item";

  index(params?: object): Promise<AxiosResponse<CompositionItem[]>> {
    return api.get<CompositionItem[]>(`${this.baseURI}`, { params });
  }

  store(data: CompositionItem): Promise<AxiosResponse<CompositionItem>> {
    return api.post<CompositionItem>(this.baseURI, data);
  }

  show(id: number): Promise<AxiosResponse<CompositionItem>> {
    return api.get<CompositionItem>(`${this.baseURI}/${id}`);
  }

  update(
    id: number,
    data: CompositionItem
  ): Promise<AxiosResponse<CompositionItem>> {
    return api.put<CompositionItem>(`${this.baseURI}/${id}`, data);
  }

  delete(id: number): Promise<AxiosResponse<void>> {
    return api.delete<void>(`${this.baseURI}/${id}`);
  }
}

export default new CompositionItemService();
