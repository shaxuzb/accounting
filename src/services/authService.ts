import { $axiosPrivate } from "./AxiosService";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string | number;
    userName: string;
    firstName: string;
    lastName: string;
  };
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
