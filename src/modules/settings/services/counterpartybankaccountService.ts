import { $axiosPrivate } from "@/services/AxiosService";
import type { ListParams, Paginated } from "@/shared/types";
import { settingsEndpoints } from "../constants/endpoints";
import type { Counterpartybankaccount} from "../types/settings";
import type { CounterpartybankaccountForm } from "../types/form";

const endpoints = settingsEndpoints.counterpartyBankAccount;

export const counterpartybankaccountService = {
  list: (params?: ListParams) =>
    $axiosPrivate.get<Paginated<Counterpartybankaccount>>(endpoints.list, { params }).then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate.get<Counterpartybankaccount>(endpoints.detail(id)).then((res) => res.data),
  create: (payload: CounterpartybankaccountForm) =>
    $axiosPrivate.post<Counterpartybankaccount>(endpoints.create, payload).then((res) => res.data),
  update: (id: string | number, payload: Partial<CounterpartybankaccountForm>) =>
    $axiosPrivate.put<Counterpartybankaccount>(endpoints.update(id), payload).then((res) => res.data),
};
