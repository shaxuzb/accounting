import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { cashBookEndpoints } from "../constants/endpoints";
import type { CashBookCashBox, CashBookReport } from "../types/type";

export const cashBookService = {
  cashBoxes: (params?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<CashBookCashBox>>(cashBookEndpoints.cashBoxes, { params })
      .then((res) => res.data),
  detail: (cashBoxId: string | number, params?: QueryParams) =>
    $axiosPrivate
      .get<CashBookReport>(cashBookEndpoints.detail, {
        params: {
          CashBoxId: cashBoxId,
          ...(params instanceof URLSearchParams
            ? Object.fromEntries(params.entries())
            : params),
        },
      })
      .then((res) => res.data),
};
