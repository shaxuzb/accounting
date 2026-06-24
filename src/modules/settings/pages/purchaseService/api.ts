import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";
import type {
  PurchaseService,
  PurchaseServiceCreate,
  PurchaseServiceDetail,
  PurchaseServiceUpdate,
} from "./types/type";

export const purchaseServiceService = {
  list: async (searchParams?: QueryParams) => {
    const { data } = await $axiosPrivate.get<Paginated<PurchaseService>>(
      endpoints.list,
      {
        params: searchParams,
      },
    );
    return data;
  },
  detail: async (id: string | number) => {
    const { data } = await $axiosPrivate.get<PurchaseServiceDetail>(
      endpoints.detail(id),
    );
    return data;
  },
  create: async (payload: PurchaseServiceCreate) => {
    const { data } = await $axiosPrivate.post<PurchaseService>(
      endpoints.create,
      payload,
    );
    return data;
  },
  update: async (id: string | number, payload: PurchaseServiceUpdate) => {
    const { data } = await $axiosPrivate.put<PurchaseService>(
      endpoints.update(id),
      payload,
    );
    return data;
  },
};
