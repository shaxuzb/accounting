import { $axiosPrivate } from "@/services/AxiosService";
import type { ListParams } from "@/shared/types";
import { productEndpoints } from "./constants/endpoints";
import type { ProductListResponse, ProductType, ProductTypeForm } from "./types/type";

export const productService = {
  list: (params?: ListParams | URLSearchParams) =>
    $axiosPrivate
      .get<ProductListResponse>(productEndpoints.list, { params })
      .then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate.get<ProductType>(productEndpoints.detail(id)).then((res) => res.data),
  create: (payload: ProductTypeForm) =>
    $axiosPrivate.post<ProductType>(productEndpoints.create, payload).then((res) => res.data),
  update: (id: string | number, payload: ProductTypeForm) =>
    $axiosPrivate.put<ProductType>(productEndpoints.update(id), payload).then((res) => res.data),
  changeProductType: (payload: { id: number; productTypeId: number }) =>
    $axiosPrivate.put(productEndpoints.changeProductType, payload).then((res) => res.data),
};
