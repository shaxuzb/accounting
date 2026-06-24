import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import { saleEndpoints } from "../constants/endpoints";
import type { SaleDocTableUpdateForm } from "../types/form";
import type { SaleDocTable } from "../types/type";

const endpoints = saleEndpoints.saleDocTable;

type SaleDocTableListResponse = Paginated<SaleDocTable> & {
  results?: SaleDocTable[];
  count?: number;
};

const normalizeListResponse = (
  data: SaleDocTableListResponse,
): Paginated<SaleDocTable> => ({
  ...data,
  items: data.items ?? data.results ?? [],
  total:
    data.total ??
    data.count ??
    data.items?.length ??
    data.results?.length ??
    0,
});

export const saleDocTableService = {
  list: () =>
    $axiosPrivate
      .get<SaleDocTableListResponse>(endpoints.list, {
        params: { Page: 1, PageSize: 1000 },
      })
      .then((res) => normalizeListResponse(res.data)),
  update: (id: string | number, payload: SaleDocTableUpdateForm) =>
    $axiosPrivate
      .put<SaleDocTable>(`${endpoints.list}/${id}`, payload)
      .then((res) => res.data),
};
