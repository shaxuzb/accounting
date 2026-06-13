import { $axiosPrivate } from "@/services/AxiosService";
import { endpoints } from "./constants/endpoints";
import type {
  Organizations,
  organizationDetail,
  organizationUpdate,
  organizationCreate,
} from "./types/type";
import type { QueryParams } from "@/shared/types/api";
import type { Paginated } from "@/shared/types";

export const organizationService = {
  list: async (searchParams?: QueryParams) => {
    const { data } = await $axiosPrivate.get<Paginated<Organizations>>(
      endpoints.list,
      {
        params: searchParams,
      },
    );
    return data;
  },
  detail: async (id: string | number) => {
    const { data } = await $axiosPrivate.get<organizationDetail>(
      endpoints.detail(id),
    );
    return data;
  },
  create: async (payload: organizationCreate) => {
    const { data } = await $axiosPrivate.post<Organizations>(
      endpoints.create,
      payload,
    );
    return data;
  },
  update: async (id: string | number, payload: Partial<organizationUpdate>) => {
    const { data } = await $axiosPrivate.put<Organizations>(
      endpoints.update(id),
      payload,
    );
    return data;
  },
};
