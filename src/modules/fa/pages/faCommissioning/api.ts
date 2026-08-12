import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";
import type { FaCommissioning, FaCommissioningPayload } from "./types/type";

export const faCommissioningService = {
  list: (params?: QueryParams) => $axiosPrivate.get<Paginated<FaCommissioning>>(endpoints.list, { params }).then((res) => res.data),
  detail: (id: string | number) => $axiosPrivate.get<FaCommissioning>(endpoints.detail(id)).then((res) => res.data),
  create: (payload: FaCommissioningPayload) => $axiosPrivate.post<number>(endpoints.list, payload).then((res) => res.data),
  update: (id: string | number, payload: FaCommissioningPayload) => $axiosPrivate.put<void>(endpoints.detail(id), payload),
  confirm: (id: string | number) => $axiosPrivate.put<void>(endpoints.confirm(id)),
  cancel: (id: string | number) => $axiosPrivate.put<void>(endpoints.cancel(id)),
};
