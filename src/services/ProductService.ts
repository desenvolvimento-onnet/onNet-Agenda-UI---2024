import api from "./api";
import { AxiosResponse } from "axios";

import Product from "../models/Product";

class ProductService {
  private baseURI: string = "/product";

  index(params?: object): Promise<AxiosResponse<Product[]>> {
    return api.get<Product[]>(`${this.baseURI}`, { params });
  }

  store(data: Product): Promise<AxiosResponse<Product>> {
    return api.post<Product>(this.baseURI, data);
  }

  show(id: number): Promise<AxiosResponse<Product>> {
    return api.get<Product>(`${this.baseURI}/${id}`);
  }

  update(id: number, data: Product): Promise<AxiosResponse<Product>> {
    return api.put<Product>(`${this.baseURI}/${id}`, data);
  }
}

export default new ProductService();
