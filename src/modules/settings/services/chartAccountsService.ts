import { $axiosPrivate } from "@/services/AxiosService";
import type { ListParams, Paginated } from "@/shared/types";
import { settingsEndpoints } from "../constants/endpoints";
import type { ChartAccounts } from "../types/settings";
import type { ChartAccountsForm } from "../types/form";

const endpoints = settingsEndpoints.chartAccounts;

export const chartAccountsService = {
  list: (params?: ListParams) =>
    $axiosPrivate.get<Paginated<ChartAccounts>>(endpoints.list, { params }).then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate.get<ChartAccounts>(endpoints.detail(id)).then((res) => res.data),
  create: (payload: ChartAccountsForm) =>
    $axiosPrivate.post<ChartAccounts>(endpoints.create, payload).then((res) => res.data),
  update: (id: string | number, payload: Partial<ChartAccountsForm>) =>
    $axiosPrivate.put<ChartAccounts>(endpoints.update(id), payload).then((res) => res.data),
};
