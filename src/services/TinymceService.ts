import api from "./api";
import { AxiosResponse } from "axios";

interface TinymceToken {
  sub: string;
  name: string;
  exp: number;
  token: string;
}

class TinymceService {
  private baseURI: string = "/tinymce";

  getToken(): Promise<AxiosResponse<TinymceToken>> {
    return api.get<TinymceToken>(`${this.baseURI}/jwt`);
  }
}

export default new TinymceService();
