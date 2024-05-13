import api from "./api";
import { AxiosResponse } from "axios";

import PhoneNumber from "../models/PhoneNumber";
import Pagination from "../models/Pagination";
import { format } from "date-fns";

export type PhoneNumberStatus =
  | "normal"
  | "gold"
  | "portability"
  | "available"
  | "inactive"
  | "alocated"
  | "reserved";

export interface PhoneNumberFilterProps
  extends Omit<PhoneNumber, "users" | "cities"> {
  query?: string;
  phoneNumberIds?: number[];
  statuses?: PhoneNumberStatus[];
  search_type?: "number" | "allocation" | "reservation" | "reservation_end";
  begin_date?: Date | string | null;
  end_date?: Date | string | null;
  users?: number[];
  cities?: number[];
  client_name?: string;
}

class PhoneNumberService {
  private baseURI: string = "/phone_number";

  index(params?: object): Promise<AxiosResponse<Pagination<PhoneNumber>>> {
    return api.get<Pagination<PhoneNumber>>(`${this.baseURI}`, { params });
  }

  store(data: PhoneNumber): Promise<AxiosResponse<PhoneNumber>> {
    return api.post<PhoneNumber>(this.baseURI, data);
  }

  show(id: number): Promise<AxiosResponse<PhoneNumber>> {
    return api.get<PhoneNumber>(`${this.baseURI}/${id}`);
  }

  update(id: number, data: PhoneNumber): Promise<AxiosResponse<PhoneNumber>> {
    return api.put<PhoneNumber>(`${this.baseURI}/${id}`, data);
  }

  delete(id: number): Promise<AxiosResponse<void>> {
    return api.delete<void>(`${this.baseURI}/${id}`);
  }

  filter(
    data: PhoneNumberFilterProps | object,
    params?: object
  ): Promise<AxiosResponse<Pagination<PhoneNumber>>> {
    return api.post<Pagination<PhoneNumber>>(
      `${this.baseURI}/filter/query`,
      data,
      { params }
    );
  }

  storeRange(
    data: PhoneNumber,
    sufixEnd: string
  ): Promise<AxiosResponse<PhoneNumber[]>> {
    return api.post<PhoneNumber[]>(`${this.baseURI}/create/range`, {
      ...data,
      sufixEnd,
    });
  }

  bindMultiple(
    contract_id: number,
    phoneNumberIds: number[]
  ): Promise<AxiosResponse<PhoneNumber[]>> {
    return api.post<PhoneNumber[]>(`${this.baseURI}/bind/${contract_id}`, {
      phoneNumberIds,
    });
  }

  unbind(id: number): Promise<AxiosResponse<PhoneNumber>> {
    return api.put<PhoneNumber>(`${this.baseURI}/unbind/${id}`);
  }

  reserve(
    id: number,
    reserved_until: Date
  ): Promise<AxiosResponse<PhoneNumber>> {
    const date = format(reserved_until, "yyyy-MM-dd 00:00:00");

    return api.post<PhoneNumber>(`${this.baseURI}/reserve/${id}`, {
      reserved_until: date,
    });
  }

  release(id: number): Promise<AxiosResponse<PhoneNumber>> {
    return api.put<PhoneNumber>(`${this.baseURI}/release/${id}`);
  }
}

export default new PhoneNumberService();
