import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";
import type { SaleCondition } from "./types/type";
import type { SaleConditionForm } from "./types/form";

export const saleConditionService = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<SaleCondition>>(endpoints.list, { params })
      .then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate
      .get<SaleCondition>(endpoints.detail(id))
      .then((res) => res.data),
  now: () =>
    $axiosPrivate.get<SaleCondition>(endpoints.now).then((res) => res.data),
  create: (payload: SaleConditionForm) =>
    $axiosPrivate
      .post<SaleCondition>(endpoints.create, payload)
      .then((res) => res.data),
  remove: (id: string | number) =>
    $axiosPrivate.delete(endpoints.delete(id)).then((res) => res.data),
};
