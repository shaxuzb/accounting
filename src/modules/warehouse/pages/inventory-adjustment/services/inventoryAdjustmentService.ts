import { $axiosPrivate } from "@/services/AxiosService";
import type { ListParams, Paginated } from "@/shared/types";
import { inventoryAdjustmentEndpoints as endpoints } from "../constants/endpoints";
import type { InventoryAdjustmentForm } from "../types/form";
import type { InventoryAdjustmentDocument } from "../types/type";
import { toInventoryAdjustmentPayload } from "../utils/inventoryAdjustment";

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
  // The controller returns the new id as a bare number, not the document —
  // typing it as a document made `created.id` undefined and sent the page to
  // /inventory-adjustments/undefined after saving.
  create: (payload: InventoryAdjustmentForm) =>
    $axiosPrivate
      .post<number>(endpoints.create, toInventoryAdjustmentPayload(payload))
      .then((res) => res.data),
  // Update, confirm and cancel all answer 204 with no body.
  update: (id: string | number, payload: InventoryAdjustmentForm) =>
    $axiosPrivate
      .put<void>(endpoints.update(id), toInventoryAdjustmentPayload(payload))
      .then(() => undefined),
  confirm: (id: string | number) =>
    $axiosPrivate.post<void>(endpoints.confirm(id)).then(() => undefined),
  cancel: (id: string | number) =>
    $axiosPrivate.post<void>(endpoints.cancel(id)).then(() => undefined),
};
