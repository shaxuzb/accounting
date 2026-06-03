import { $axiosPrivate } from "./AxiosService";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: { id: string | number; organizationId?: string | number; [key: string]: unknown };
}

export const authService = {
  login: (payload: LoginPayload) =>
    $axiosPrivate.post<LoginResponse>("/auth/login", payload).then((res) => res.data),
  me: () => $axiosPrivate.get("/auth/me").then((res) => res.data),
};
