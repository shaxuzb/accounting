import { roleEndpoint } from "@/modules/settings/constants/endpoints";
import { $axiosPrivate } from "@/services/AxiosService";
import { QueryParams } from "@/types/api";

export const roleService = {
  getList: async <TResponse = unknown>(
    searchParams?: QueryParams,
    organizationId?: number,
  ): Promise<TResponse> => {
    const { data } = await $axiosPrivate.get(roleEndpoint.LIST, {
      params: {
        ...searchParams,
        organizationId,
      },
    });
    return data as TResponse;
  },
  getDetail: async <TResponse = unknown>(
    roleId: number,
  ): Promise<TResponse> => {
    const { data } = await $axiosPrivate.get(roleEndpoint.DETAIL(roleId));
    return data as TResponse;
  },
  getModules: async <TResponse = unknown>(
    organizationId?: number,
  ): Promise<TResponse> => {
    const { data } = await $axiosPrivate.get(roleEndpoint.MODULESUBGROUPS, {
      params: {
        organizationId,
      },
    });
    return data as TResponse;
  },
  createRole: async <TPayload = unknown, TResponse = unknown>(
    values: TPayload,
  ): Promise<TResponse> => {
    const { data } = await $axiosPrivate.post(roleEndpoint.CREATE, values);
    return data as TResponse;
  },
  updateRole: async <TPayload = unknown, TResponse = unknown>(
    id: number,
    values: TPayload,
  ): Promise<TResponse> => {
    const { data } = await $axiosPrivate.put(roleEndpoint.UPDATE(id), values);
    return data as TResponse;
  },
};
