import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { cashFiscalTransferEndpoints as endpoints } from "../constants/endpoints";
import type { CashFiscalTransferRequest } from "../types/form";
import type { CashFiscalTransfer } from "../types/type";

const voidResponse = <T>(promise: Promise<{ data: T }>) => promise.then(() => undefined);

export const cashFiscalTransferService = {
  list: (params?: QueryParams) => $axiosPrivate.get<Paginated<CashFiscalTransfer>>(endpoints.list, { params }).then((response) => response.data),
  fiscalBalance: (params: { fiscalCashRegisterId: number; currencyId: number; date: string }) =>
    $axiosPrivate.get<number>(endpoints.fiscalBalance, { params }).then((response) => response.data),
  detail: (id: string | number) => $axiosPrivate.get<CashFiscalTransfer>(endpoints.detail(id)).then((response) => response.data),
  create: (payload: CashFiscalTransferRequest) => $axiosPrivate.post<number>(endpoints.create, payload).then((response) => response.data),
  update: (id: string | number, payload: CashFiscalTransferRequest) => voidResponse($axiosPrivate.put(endpoints.update(id), payload)),
  remove: (id: string | number) => voidResponse($axiosPrivate.delete(endpoints.delete(id))),
  confirm: (id: string | number) => voidResponse($axiosPrivate.put(endpoints.confirm(id))),
  cancel: (id: string | number) => voidResponse($axiosPrivate.put(endpoints.cancel(id))),
};
