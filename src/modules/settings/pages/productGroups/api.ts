import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";
import type { ProductGroups} from "./types/type";
import type { ProductGroupsForm } from "./types/form";

export const productGroupsService = {
  list: (params?: QueryParams) =>
    $axiosPrivate.get<Paginated<ProductGroups>>(endpoints.list, { params }).then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate.get<ProductGroups>(endpoints.detail(id)).then((res) => res.data),
  create: (payload: ProductGroupsForm) =>
    $axiosPrivate.post<ProductGroups>(endpoints.create, payload).then((res) => res.data),
  update: (id: string | number, payload: Partial<ProductGroupsForm>) =>
    $axiosPrivate.put<ProductGroups>(endpoints.update(id), payload).then((res) => res.data),
};
