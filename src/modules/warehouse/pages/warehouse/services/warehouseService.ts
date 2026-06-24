import { $axiosPrivate } from "@/services/AxiosService";
import type { ListParams, Paginated } from "@/shared/types";
import { warehouseEndpoints } from "../constants/endpoints";
import type { ProductStock, ProductStockSerial } from "../types/type";

type QueryParams = ListParams | URLSearchParams;

const endpoints = warehouseEndpoints.productStock;

export const warehouseService = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<ProductStock>>(endpoints.list, { params })
      .then((res) => res.data),
  detail: (params?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<ProductStock>>(endpoints.detail, { params })
      .then((res) => res.data),
  detailSerial: (params?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<ProductStockSerial>>(endpoints.detailSerial, { params })
      .then((res) => res.data),
};
