import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import { endpoints } from "./constants/endpoints";
import type {
  ProductStock,
  ProductStockGroup,
  ProductStockSerial,
} from "./types/type";
import type { Params } from "./hooks/useGetDetailSerialWarehouse";

type RawParams = URLSearchParams | Record<string, unknown>;

export const warehouseService = {
  groups: (params?: RawParams) =>
    $axiosPrivate
      .get<Paginated<ProductStockGroup>>(endpoints.groups, { params })
      .then((res) => res.data),
  products: (params?: Params) =>
    $axiosPrivate
      .get<Paginated<ProductStock>>(endpoints.products, { params })
      .then((res) => res.data),
  tables: (params?: Params) =>
    $axiosPrivate
      .get<Paginated<ProductStockSerial>>(endpoints.tables, { params })
      .then((res) => res.data),
  byMarking: (markingNumber: string) =>
    $axiosPrivate
      .get<ProductStock>(endpoints.byMarking, { params: { markingNumber } })
      .then((res) => res.data),
};
