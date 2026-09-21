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
  // Create yalang'och id raqamini qaytaradi, hujjat obyektini emas; update,
  // confirm va cancel esa 204 bilan bo'sh javob beradi. Ilgari uchalasi ham
  // hujjat deb tiplangan edi: created.id undefined chiqardi va bo'sh javob
  // keshdagi hujjatni o'chirib yuborardi.
  create: (payload: InventoryCountCreatePayload) =>
    $axiosPrivate
      .post<number>(endpoints.create, payload)
      .then((res) => res.data),
  update: (id: string | number, payload: InventoryCountUpdatePayload) =>
    $axiosPrivate
      .put<void>(endpoints.update(id), payload)
      .then(() => undefined),
  delete: (id: string | number) =>
    $axiosPrivate.delete<unknown>(endpoints.delete(id)).then((res) => res.data),
  confirm: (id: string | number) =>
    $axiosPrivate.post<void>(endpoints.confirm(id)).then(() => undefined),
  cancel: (id: string | number) =>
    $axiosPrivate.post<void>(endpoints.cancel(id)).then(() => undefined),
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
