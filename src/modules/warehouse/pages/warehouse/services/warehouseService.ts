import { $axiosPrivate } from "@/services/AxiosService";
import type { ListParams, Paginated } from "@/shared/types";
import { warehouseEndpoints } from "../constants/endpoints";
import type { WarehouseAll } from "../types/type";


const endpoints = warehouseEndpoints.warehouse;

export const warehouseService = {
  list: (params?: ListParams) =>
    $axiosPrivate.get<Paginated<WarehouseAll>>(endpoints.list, { params }).then((res) => res.data),
  detail: (params?: ListParams | URLSearchParams) =>
    $axiosPrivate.get<WarehouseAll>(endpoints.detail, { params }).then((res) => res.data),
  detailSerial: (params?: ListParams | URLSearchParams) =>
    $axiosPrivate.get<WarehouseAll>(endpoints.detailSerial, { params }).then((res) => res.data),
};
