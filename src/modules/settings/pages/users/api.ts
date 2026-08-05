import { $axiosPrivate } from "@/services/AxiosService";
import type { ListParams, Paginated } from "@/shared/types";
import { endpoints } from "./constants/endpoints";
import type { Users } from "./types/type";
import type { CreateUserPayload, UpdateUserPayload } from "./types/form";

export const usersService = {
  list: (params?: ListParams | URLSearchParams) =>
    $axiosPrivate
      .get<Paginated<Users>>(endpoints.list, { params })
      .then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate.get<Users>(endpoints.detail(id)).then((res) => res.data),
  create: (payload: CreateUserPayload) =>
    $axiosPrivate
      .post<Users>(endpoints.create, payload)
      .then((res) => res.data),
  update: (id: string | number, payload: UpdateUserPayload) =>
    $axiosPrivate
      .put<Users>(endpoints.update(id), payload)
      .then((res) => res.data),
};
