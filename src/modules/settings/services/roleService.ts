import { $axiosPrivate } from "@/services/AxiosService";
import { settingsEndpoints } from "../constants/endpoints";
import type {
  Role,
  RoleDetail,
  RoleForm,
  RoleModuleGroup,
} from "../types/settings";
import type { QueryParams } from "@/shared/types/api";
import type { Paginated } from "@/shared/types";

const endpoints = settingsEndpoints.role;

export const roleService = {
  list: async (searchParams?: QueryParams) => {
    const { data } = await $axiosPrivate.get<Paginated<Role>>(
      settingsEndpoints.role.list,
      {
        params: searchParams,
      },
    );
    return data;
  },
  detail: (id: string | number) =>
    $axiosPrivate.get<RoleDetail>(endpoints.detail(id)).then((res) => res.data),
  modules: (organizationId?: string | number) =>
    $axiosPrivate
      .get<RoleModuleGroup[]>(endpoints.modules, { params: { organizationId } })
      .then((res) => res.data),
  create: (payload: RoleForm) =>
    $axiosPrivate.post<Role>(endpoints.create, payload).then((res) => res.data),
  update: (id: string | number, payload: Partial<RoleForm>) =>
    $axiosPrivate
      .put<Role>(endpoints.update(id), payload)
      .then((res) => res.data),
};
