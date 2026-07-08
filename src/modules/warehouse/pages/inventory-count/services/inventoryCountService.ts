import { $axiosPrivate } from "@/services/AxiosService";
import type { ListParams, Paginated } from "@/shared/types";
import { inventoryCountEndpoints as endpoints } from "../constants/endpoints";
import type {
  InventoryCountDifference,
  InventoryCountDocument,
  InventoryCountInventoryMovement,
  InventoryCountListFilter,
  InventoryCountPostingBatch,
} from "../types/type";
import type {
  InventoryCountCreatePayload,
  InventoryCountUpdatePayload,
} from "../types/form";

type QueryParams = ListParams | URLSearchParams | InventoryCountListFilter;

export const inventoryCountService = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<InventoryCountDocument>>(endpoints.list, { params })
      .then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate
      .get<InventoryCountDocument>(endpoints.detail(id))
      .then((res) => res.data),
  create: (payload: InventoryCountCreatePayload) =>
    $axiosPrivate
      .post<InventoryCountDocument>(endpoints.create, payload)
      .then((res) => res.data),
  update: (id: string | number, payload: InventoryCountUpdatePayload) =>
    $axiosPrivate
      .put<InventoryCountDocument>(endpoints.update(id), payload)
      .then((res) => res.data),
  delete: (id: string | number) =>
    $axiosPrivate.delete<unknown>(endpoints.delete(id)).then((res) => res.data),
  confirm: (id: string | number) =>
    $axiosPrivate
      .post<InventoryCountDocument>(endpoints.confirm(id))
      .then((res) => res.data),
  cancel: (id: string | number) =>
    $axiosPrivate
      .post<InventoryCountDocument>(endpoints.cancel(id))
      .then((res) => res.data),
  differences: (id: string | number) =>
    $axiosPrivate
      .get<InventoryCountDifference[]>(endpoints.differences(id))
      .then((res) => res.data),
  postingBatches: (id: string | number) =>
    $axiosPrivate
      .get<InventoryCountPostingBatch[]>(endpoints.postingBatches(id))
      .then((res) => res.data),
  inventoryMovements: (id: string | number) =>
    $axiosPrivate
      .get<InventoryCountInventoryMovement[]>(endpoints.inventoryMovements(id))
      .then((res) => res.data),
};
