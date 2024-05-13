import api from "./api";
import { AxiosResponse } from "axios";
import User from "../models/User";
import Permission from "../models/Permission";
import City from "../models/City";

interface Token {
  type: string;
  token: string;
  refreshToken: string | null;
}

interface AuthProps {
  auth: Token;
  user: User;
  permissions: Permission[];
  cities: City[];
}

class AuthService {
  private baseURI: string = "/auth";

  authenticate(
    email: string,
    password: string
  ): Promise<AxiosResponse<AuthProps>> {
    return api.post<AuthProps>(this.baseURI, { email, password });
  }

  refreshData(): Promise<AxiosResponse<Omit<AuthProps, "auth">>> {
    return api.get<Omit<AuthProps, "auth">>(`${this.baseURI}/refresh`);
  }
}

export default new AuthService();
