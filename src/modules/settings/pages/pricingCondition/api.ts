import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";
import type { PricingCondition } from "./types/type";
import type { PricingConditionForm } from "./types/form";

export const pricingConditionService = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<PricingCondition>>(endpoints.list, { params })
      .then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate
      .get<PricingCondition>(endpoints.detail(id))
      .then((res) => res.data),
  now: () =>
    $axiosPrivate
      .get<PricingCondition>(endpoints.now)
      .then((res) => res.data),
  create: (payload: PricingConditionForm) =>
    $axiosPrivate
      .post<PricingCondition>(endpoints.create, payload)
      .then((res) => res.data),
  remove: (id: string | number) =>
    $axiosPrivate.delete(endpoints.delete(id)).then((res) => res.data),
};
