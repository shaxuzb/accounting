import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";
import type { Branches } from "./types/type";
import type { BranchesForm } from "./types/form";

export const branchesService = {
  list: (params?: QueryParams) =>
    $axiosPrivate.get<Paginated<Branches>>(endpoints.list, { params }).then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate.get<Branches>(endpoints.detail(id)).then((res) => res.data),
  create: (payload: BranchesForm) =>
    $axiosPrivate.post<Branches>(endpoints.create, payload).then((res) => res.data),
  update: (id: string | number, payload: Partial<BranchesForm>) =>
    $axiosPrivate.put<Branches>(endpoints.update(id), payload).then((res) => res.data),
};
