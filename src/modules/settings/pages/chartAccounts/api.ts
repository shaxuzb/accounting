import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";
import type { ChartAccounts } from "./types/type";
import type { ChartAccountsForm } from "./types/form";

export const chartAccountsService = {
  list: (params?: QueryParams) =>
    $axiosPrivate.get<Paginated<ChartAccounts>>(endpoints.list, { params }).then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate.get<ChartAccounts>(endpoints.detail(id)).then((res) => res.data),
  create: (payload: ChartAccountsForm) =>
    $axiosPrivate.post<ChartAccounts>(endpoints.create, payload).then((res) => res.data),
  update: (id: string | number, payload: Partial<ChartAccountsForm>) =>
    $axiosPrivate.put<ChartAccounts>(endpoints.update(id), payload).then((res) => res.data),
};
