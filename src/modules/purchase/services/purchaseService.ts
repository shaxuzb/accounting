import { $axiosPrivate } from "@/services/AxiosService";
import type { ListParams, Paginated } from "@/shared/types";
import { purchaseEndpoints } from "../constants/endpoints";
import type { Purchase, PurchaseForm } from "../types/purchase";

const endpoints = purchaseEndpoints.purchase;

export const purchaseService = {
  list: (params?: ListParams) =>
    $axiosPrivate.get<Paginated<Purchase>>(endpoints.list, { params }).then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate.get<Purchase>(endpoints.detail(id)).then((res) => res.data),
  create: (payload: PurchaseForm) =>
    $axiosPrivate.post<Purchase>(endpoints.create, payload).then((res) => res.data),
  update: (id: string | number, payload: Partial<PurchaseForm>) =>
    $axiosPrivate.put<Purchase>(endpoints.update(id), payload).then((res) => res.data),
};
