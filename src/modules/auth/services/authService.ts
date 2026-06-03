import { $axiosPrivate } from "@/services/AxiosService";
import type { ListParams, Paginated } from "@/shared/types";
import { authEndpoints } from "../constants/endpoints";
import type { Auth, AuthForm } from "../types/auth";

const endpoints = authEndpoints.auth;

export const authService = {
  list: (params?: ListParams) =>
    $axiosPrivate.get<Paginated<Auth>>(endpoints.list, { params }).then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate.get<Auth>(endpoints.detail(id)).then((res) => res.data),
  create: (payload: AuthForm) =>
    $axiosPrivate.post<Auth>(endpoints.create, payload).then((res) => res.data),
  update: (id: string | number, payload: Partial<AuthForm>) =>
    $axiosPrivate.put<Auth>(endpoints.update(id), payload).then((res) => res.data),
};
