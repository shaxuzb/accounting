import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";
import type { Counterpartybankaccount} from "./types/type";
import type { CounterpartybankaccountForm } from "./types/form";

export const counterpartybankaccountService = {
  list: (params?: QueryParams) =>
    $axiosPrivate.get<Paginated<Counterpartybankaccount>>(endpoints.list, { params }).then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate.get<Counterpartybankaccount>(endpoints.detail(id)).then((res) => res.data),
  create: (payload: CounterpartybankaccountForm) =>
    $axiosPrivate.post<Counterpartybankaccount>(endpoints.create, payload).then((res) => res.data),
  update: (id: string | number, payload: Partial<CounterpartybankaccountForm>) =>
    $axiosPrivate.put<Counterpartybankaccount>(endpoints.update(id), payload).then((res) => res.data),
};
