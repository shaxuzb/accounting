import { $axiosPrivate } from "@/services/AxiosService";
import type { ListParams, Paginated } from "@/shared/types";
import { settingsEndpoints } from "../constants/endpoints";
import type { ProductGroups} from "../types/settings";
import type { ProductGroupsForm } from "../types/form";

const endpoints = settingsEndpoints.productGroups;

export const productGroupsService = {
  list: (params?: ListParams) =>
    $axiosPrivate.get<Paginated<ProductGroups>>(endpoints.list, { params }).then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate.get<ProductGroups>(endpoints.detail(id)).then((res) => res.data),
  create: (payload: ProductGroupsForm) =>
    $axiosPrivate.post<ProductGroups>(endpoints.create, payload).then((res) => res.data),
  update: (id: string | number, payload: Partial<ProductGroupsForm>) =>
    $axiosPrivate.put<ProductGroups>(endpoints.update(id), payload).then((res) => res.data),
};
