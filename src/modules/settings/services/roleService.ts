import { $axiosPrivate } from "@/services/AxiosService";
import type { ListParams, Paginated } from "@/shared/types";
import { settingsEndpoints } from "../constants/endpoints";
import type { Role, RoleForm } from "../types/settings";

const endpoints = settingsEndpoints.role;

export const roleService = {
  list: (params?: ListParams) =>
    $axiosPrivate.get<Paginated<Role>>(endpoints.list, { params }).then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate.get<Role>(endpoints.detail(id)).then((res) => res.data),
  create: (payload: RoleForm) =>
    $axiosPrivate.post<Role>(endpoints.create, payload).then((res) => res.data),
  update: (id: string | number, payload: Partial<RoleForm>) =>
    $axiosPrivate.put<Role>(endpoints.update(id), payload).then((res) => res.data),
};
