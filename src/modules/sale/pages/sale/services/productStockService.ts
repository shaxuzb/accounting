import { $axiosPrivate } from "@/services/AxiosService";
import type { ListParams, Paginated } from "@/shared/types";
import { saleEndpoints } from "../constants/endpoints";
import type { SaleProductStock } from "../types/type";

type QueryParams = ListParams | URLSearchParams;
type ProductStockListResponse = Partial<Paginated<SaleProductStock>> & {
  results?: SaleProductStock[];
  count?: number;
  totalCount?: number;
};

const normalizeProductStocks = (
  data: ProductStockListResponse,
): Paginated<SaleProductStock> => ({
  ...data,
  items: data.items ?? data.results ?? [],
  total:
    data.total ??
    data.totalCount ??
    data.count ??
    data.items?.length ??
    data.results?.length ??
    0,
});

export const productStockService = {
  products: (params?: QueryParams) =>
    $axiosPrivate
      .get<ProductStockListResponse>(saleEndpoints.productStock.products, {
        params,
      })
      .then((res) => normalizeProductStocks(res.data)),
};
