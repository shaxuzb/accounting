import type { User } from "@/shared/types";
import { $axiosPrivate } from "./AxiosService";

export interface LoginPayload {
  userName: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User | null;
  // ;organizationId?: string | number;
  // [key: string]: unknown
}

export const authService = {
  login: async (payload: LoginPayload) => {
    const data = await $axiosPrivate.post<LoginResponse>(
      "/auth/login",
      payload,
    );
    return data;
  },

  authCheck: async () => await $axiosPrivate.get("/auth/auth-check"),
};
