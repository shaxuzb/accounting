import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import { saleEndpoints } from "../constants/endpoints";
import type { SaleDocTable } from "../types/type";

const endpoints = saleEndpoints.saleDocTable;

export const saleDocTableService = {
  list: (ownerId: string | number) =>
    $axiosPrivate
      .get<Paginated<SaleDocTable>>(endpoints.list, {
        params: { ownerId, page: 1, pageSize: 1000 },
      })
      .then((res) => res.data),
};
