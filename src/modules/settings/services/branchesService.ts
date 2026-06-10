import { $axiosPrivate } from "@/services/AxiosService";
import type { ListParams, Paginated } from "@/shared/types";
import { settingsEndpoints } from "../constants/endpoints";
import type { Branches } from "../types/settings";
import type { BranchesForm } from "../types/form";

const endpoints = settingsEndpoints.branches;

export const branchesService = {
  list: (params?: ListParams) =>
    $axiosPrivate.get<Paginated<Branches>>(endpoints.list, { params }).then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate.get<Branches>(endpoints.detail(id)).then((res) => res.data),
  create: (payload: BranchesForm) =>
    $axiosPrivate.post<Branches>(endpoints.create, payload).then((res) => res.data),
  update: (id: string | number, payload: Partial<BranchesForm>) =>
    $axiosPrivate.put<Branches>(endpoints.update(id), payload).then((res) => res.data),
};
