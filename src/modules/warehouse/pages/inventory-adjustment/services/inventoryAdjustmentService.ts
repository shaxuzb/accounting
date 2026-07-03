import { $axiosPrivate } from "@/services/AxiosService";
import type { ListParams, Paginated } from "@/shared/types";
import { inventoryAdjustmentEndpoints as endpoints } from "../constants/endpoints";
import type { InventoryAdjustmentForm } from "../types/form";
import type { InventoryAdjustmentDocument } from "../types/type";

type QueryParams = ListParams | URLSearchParams;

export const inventoryAdjustmentService = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<InventoryAdjustmentDocument>>(endpoints.list, { params })
      .then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate
      .get<InventoryAdjustmentDocument>(endpoints.detail(id))
      .then((res) => res.data),
  create: (payload: InventoryAdjustmentForm) =>
    $axiosPrivate
      .post<InventoryAdjustmentDocument>(endpoints.create, payload)
      .then((res) => res.data),
  update: (id: string | number, payload: InventoryAdjustmentForm) =>
    $axiosPrivate
      .put<InventoryAdjustmentDocument>(endpoints.update(id), payload)
      .then((res) => res.data),
  confirm: (id: string | number) =>
    $axiosPrivate
      .post<InventoryAdjustmentDocument>(endpoints.confirm(id))
      .then((res) => res.data),
  cancel: (id: string | number) =>
    $axiosPrivate
      .post<InventoryAdjustmentDocument>(endpoints.cancel(id))
      .then((res) => res.data),
};
