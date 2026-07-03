import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { cashOperationEndpoints } from "../constants/endpoints";
import type { CashOperation } from "../types/type";
import type { CashOperationForm } from "../types/form";

export const cashOperationService = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<CashOperation>>(cashOperationEndpoints.list, { params })
      .then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate
      .get<CashOperation>(cashOperationEndpoints.detail(id))
      .then((res) => res.data),
  create: (payload: CashOperationForm) =>
    $axiosPrivate
      .post<CashOperation>(cashOperationEndpoints.create, payload)
      .then((res) => res.data),
  update: (id: string | number, payload: Partial<CashOperationForm>) =>
    $axiosPrivate
      .put<CashOperation>(cashOperationEndpoints.update(id), payload)
      .then((res) => res.data),
};
