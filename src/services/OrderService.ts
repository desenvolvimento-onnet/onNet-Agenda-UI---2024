import api from "./api";
import { AxiosResponse } from "axios";

import Order from "../models/Order";
import Pagination from "../models/Pagination";

export interface OrderFilterProps {
  client?: string;
  os?: number;
  search_type?: "os" | "open" | "closing" | "cancellation";
  begin_date?: Date | string | null;
  end_date?: Date | string | null;
  statuses?: string[];
  users?: number[];
  cities?: number[];
  shifts?: number[];
}

class OrderService {
  private baseURI: string = "/order";

  index(params?: object): Promise<AxiosResponse<Pagination<Order>>> {
    return api.get<Pagination<Order>>(this.baseURI, { params });
  }

  store(data: Order): Promise<AxiosResponse<Order>> {
    return api.post<Order>(this.baseURI, data);
  }

  show(id: number): Promise<AxiosResponse<Order>> {
    return api.get<Order>(`${this.baseURI}/${id}`);
  }

  update(id: number, data: Order): Promise<AxiosResponse<Order>> {
    return api.put<Order>(`${this.baseURI}/${id}`, data);
  }

  indexByQuery(
    query: string,
    params?: object
  ): Promise<AxiosResponse<Pagination<Order>>> {
    return api.get<Pagination<Order>>(`${this.baseURI}/find/query`, {
      params: { ...params, query },
    });
  }

  close(id: number, closing_note?: string): Promise<AxiosResponse<Order>> {
    return api.put<Order>(`${this.baseURI}/close/${id}`, { closing_note });
  }

  cancel(
    id: number,
    cancellation_reason: string
  ): Promise<AxiosResponse<Order>> {
    return api.put<Order>(`${this.baseURI}/cancel/${id}`, {
      cancellation_reason,
    });
  }

  filter(
    data: OrderFilterProps | object,
    params?: object
  ): Promise<AxiosResponse<Pagination<Order>>> {
    return api.post<Pagination<Order>>(`${this.baseURI}/filter/query`, data, {
      params,
    });
  }
}

export default new OrderService();
