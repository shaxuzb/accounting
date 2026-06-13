import { $axiosPrivate } from "@/services/AxiosService";
import type { ListParams, Paginated } from "@/shared/types";
import type { CounterpartyContact } from "./types/type";
import type { CounterpartyContactForm } from "./types/form";
import { endpoints } from "./constants/endpoints";


export const counterpartycontactService = {
  list: (params?: ListParams | URLSearchParams) =>
    $axiosPrivate.get<Paginated<CounterpartyContact>>(endpoints.list, { params }).then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate.get<CounterpartyContact>(endpoints.detail(id)).then((res) => res.data),
  create: (payload: CounterpartyContactForm) =>
    $axiosPrivate.post<CounterpartyContact>(endpoints.create, payload).then((res) => res.data),
  update: (id: string | number, payload: Partial<CounterpartyContactForm>) =>
    $axiosPrivate.put<CounterpartyContact>(endpoints.update(id), payload).then((res) => res.data),
};