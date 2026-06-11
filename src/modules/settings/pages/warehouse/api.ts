import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";
import type { Warehouse } from "./types/type";
import type { WarehouseForm } from "./types/form";



export const warehouseService = {
  list: (params?: QueryParams) =>
    $axiosPrivate.get<Paginated<Warehouse>>(endpoints.list, { params }).then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate.get<Warehouse>(endpoints.detail(id)).then((res) => res.data),
  create: (payload: WarehouseForm) =>
    $axiosPrivate.post<Warehouse>(endpoints.create, payload).then((res) => res.data),
  update: (id: string | number, payload: Partial<WarehouseForm>) =>
    $axiosPrivate.put<Warehouse>(endpoints.update(id), payload).then((res) => res.data),
};
