import { $axiosPrivate } from "@/services/AxiosService";
import type { ListParams, Paginated } from "@/shared/types";
import { inventoryCountEndpoints as endpoints } from "../constants/endpoints";
import type { InventoryCountForm } from "../types/form";
import type {
  InventoryCountDifference,
  InventoryCountDocument,
} from "../types/type";

type QueryParams = ListParams | URLSearchParams;

export const inventoryCountService = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<InventoryCountDocument>>(endpoints.list, { params })
      .then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate
      .get<InventoryCountDocument>(endpoints.detail(id))
      .then((res) => res.data),
  create: (payload: InventoryCountForm) =>
    $axiosPrivate
      .post<InventoryCountDocument>(endpoints.create, payload)
      .then((res) => res.data),
  update: (id: string | number, payload: InventoryCountForm) =>
    $axiosPrivate
      .put<InventoryCountDocument>(endpoints.update(id), payload)
      .then((res) => res.data),
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
};
