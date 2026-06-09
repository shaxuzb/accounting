import { $axiosPrivate } from "@/services/AxiosService";
import { settingsEndpoints } from "../constants/endpoints";
import type {
  Organizations,
  organizationDetail,
  organizationUpdate,
  organizationCreate,
} from "../types/settings";
import type { QueryParams } from "@/shared/types/api";
import type { Paginated } from "@/shared/types";

const endpoints = settingsEndpoints.organizations;

export const organizationService = {
  list: async (searchParams?: QueryParams) => {
    const { data } = await $axiosPrivate.get<Paginated<Organizations>>(
      settingsEndpoints.organizations.list,
      {
        params: searchParams,
      },
    );
    return data;
  },
  detail: (id: string | number) =>
    $axiosPrivate
      .get<organizationDetail>(endpoints.detail(id))
      .then((res) => res.data),
  create: (payload: organizationCreate) =>
    $axiosPrivate
      .post<Organizations>(endpoints.create, payload)
      .then((res) => res.data),
  update: (id: string | number, payload: Partial<organizationUpdate>) =>
    $axiosPrivate
      .put<Organizations>(endpoints.update(id), payload)
      .then((res) => res.data),
};
