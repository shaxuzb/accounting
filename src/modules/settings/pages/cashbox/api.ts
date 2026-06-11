import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";
import type { CashBox } from "./types/type";
import type { CashBoxForm } from "./types/form";



export const cashBoxService = {
  list: (params?: QueryParams) =>
    $axiosPrivate.get<Paginated<CashBox>>(endpoints.list, { params }).then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate.get<CashBox>(endpoints.detail(id)).then((res) => res.data),
  create: (payload: CashBoxForm) =>
    $axiosPrivate.post<CashBox>(endpoints.create, payload).then((res) => res.data),
  update: (id: string | number, payload: Partial<CashBoxForm>) =>
    $axiosPrivate.put<CashBox>(endpoints.update(id), payload).then((res) => res.data),
};
