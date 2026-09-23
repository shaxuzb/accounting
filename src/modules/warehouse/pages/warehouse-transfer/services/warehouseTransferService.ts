import { $axiosPrivate } from "@/services/AxiosService";
import type { ListParams, Paginated } from "@/shared/types";
import { warehouseTransferEndpoints as endpoints } from "../constants/endpoints";
import type { WarehouseTransferForm } from "../types/form";
import { toWarehouseTransferPayload } from "../utils/transfer";
import type { WarehouseTransferDocument } from "../types/type";

type QueryParams = ListParams | URLSearchParams;

export const warehouseTransferService = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<WarehouseTransferDocument>>(endpoints.list, { params })
      .then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate
      .get<WarehouseTransferDocument>(endpoints.detail(id))
      .then((res) => res.data),
  create: (payload: WarehouseTransferForm) =>
    $axiosPrivate
      .post<WarehouseTransferDocument>(endpoints.create, toWarehouseTransferPayload(payload))
      .then((res) => res.data),
  update: (id: string | number, payload: WarehouseTransferForm) =>
    $axiosPrivate
      .put<WarehouseTransferDocument>(endpoints.update(id), toWarehouseTransferPayload(payload))
      .then((res) => res.data),
  confirm: (id: string | number) =>
    $axiosPrivate
      .post<WarehouseTransferDocument>(endpoints.confirm(id))
      .then((res) => res.data),
  cancel: (id: string | number) =>
    $axiosPrivate
      .post<WarehouseTransferDocument>(endpoints.cancel(id))
      .then((res) => res.data),
};
