import { $axiosPrivate } from "@/services/AxiosService";
import type { ListParams, Paginated } from "@/shared/types";
import { settingsEndpoints } from "../constants/endpoints";
import type { Counterparty } from "../types/settings";
import type { CounterpartyForm } from "../types/form";

const endpoints = settingsEndpoints.counterparty;

export const counterpartyService = {
  list: (params?: ListParams) =>
    $axiosPrivate.get<Paginated<Counterparty>>(endpoints.list, { params }).then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate.get<Counterparty>(endpoints.detail(id)).then((res) => res.data),
  create: (payload: CounterpartyForm) =>
    $axiosPrivate.post<Counterparty>(endpoints.create, payload).then((res) => res.data),
  update: (id: string | number, payload: Partial<CounterpartyForm>) =>
    $axiosPrivate.put<Counterparty>(endpoints.update(id), payload).then((res) => res.data),
};
