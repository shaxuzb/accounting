import { $axiosPrivate } from "@/services/AxiosService";
import type { ListParams, Paginated } from "@/shared/types";
import { productsEndpoints } from "../constants/endpoints";
import type { Products, ProductsForm } from "../types/products";

const endpoints = productsEndpoints.products;

export const productsService = {
  list: (params?: ListParams) =>
    $axiosPrivate.get<Paginated<Products>>(endpoints.list, { params }).then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate.get<Products>(endpoints.detail(id)).then((res) => res.data),
  create: (payload: ProductsForm) =>
    $axiosPrivate.post<Products>(endpoints.create, payload).then((res) => res.data),
  update: (id: string | number, payload: Partial<ProductsForm>) =>
    $axiosPrivate.put<Products>(endpoints.update(id), payload).then((res) => res.data),
};
