import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";
import type { Counterparty } from "./types/type";
import type { CounterpartyForm } from "./types/form";

export const counterpartyService = {
  list: (params?: QueryParams) =>
    $axiosPrivate.get<Paginated<Counterparty>>(endpoints.list, { params }).then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate.get<Counterparty>(endpoints.detail(id)).then((res) => res.data),
  create: (payload: CounterpartyForm) =>
    $axiosPrivate.post<Counterparty>(endpoints.create, payload).then((res) => res.data),
  update: (id: string | number, payload: Partial<CounterpartyForm>) =>
    $axiosPrivate.put<Counterparty>(endpoints.update(id), payload).then((res) => res.data),
};
