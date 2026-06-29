import { $axiosPrivate } from "@/services/AxiosService";
import { productEndpoints } from "./constants/endpoints";
import type {
  ProductListResponse,
  ProductType,
} from "./types/type";
import type {
  ProductGroupCreateDto,
  ProductGroupUpdateDto,
} from "./types/form";

export const productService = {
  list: (params?: Record<string, unknown>) =>
    $axiosPrivate
      .get<ProductListResponse>(productEndpoints.list, { params })
      .then((res) => res.data),

  detail: (id: string | number, isService?: boolean) =>
    $axiosPrivate
      .get<ProductType>(productEndpoints.detail(id), {
        params: isService !== undefined ? { isService } : undefined,
      })
      .then((res) => res.data),

  create: (payload: ProductGroupCreateDto) =>
    $axiosPrivate
      .post<ProductType>(productEndpoints.create, payload)
      .then((res) => res.data),

  update: (id: string | number, payload: ProductGroupUpdateDto) =>
    $axiosPrivate
      .put<ProductType>(productEndpoints.update(id), payload)
      .then((res) => res.data),
};
