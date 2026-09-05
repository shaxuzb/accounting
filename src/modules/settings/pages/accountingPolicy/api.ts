import { $axiosPrivate } from "@/services/AxiosService";
import { accountingPolicyEndpoints } from "./constants/endpoints";
import {
  buildAccountingPolicyHistoryQuery,
  buildAccountingPolicyImpactQuery,
} from "./api/query";
import type {
  AccountingPolicyCurrentDto,
  AccountingPolicyHistoryDto,
  AccountingPolicyImpactDto,
  AccountingPolicyUpdateRequest,
  TaxType,
  VatRate,
} from "./types/type";

export const accountingPolicyService = {
  current: (effectiveOn?: string) =>
    $axiosPrivate
      .get<AccountingPolicyCurrentDto>(accountingPolicyEndpoints.current, {
        params: effectiveOn ? { effectiveOn } : undefined,
      })
      .then((response) => response.data),
  history: (dateFrom?: string, dateTo?: string) =>
    $axiosPrivate
      .get<AccountingPolicyHistoryDto>(accountingPolicyEndpoints.history, {
        params: buildAccountingPolicyHistoryQuery({ dateFrom, dateTo }),
      })
      .then((response) => response.data),
  impact: (effectiveOn: string, documentType?: string) =>
    $axiosPrivate
      .get<AccountingPolicyImpactDto>(accountingPolicyEndpoints.impact, {
        params: buildAccountingPolicyImpactQuery({ effectiveOn, documentType }),
      })
      .then((response) => response.data),
  update: (payload: AccountingPolicyUpdateRequest) =>
    $axiosPrivate
      .put<AccountingPolicyCurrentDto>(
        accountingPolicyEndpoints.update,
        payload,
      )
      .then((response) => response.data),
  taxTypes: () =>
    $axiosPrivate
      .get<TaxType[]>(accountingPolicyEndpoints.taxTypes)
      .then((response) => response.data),
  vatRates: () =>
    $axiosPrivate
      .get<VatRate[]>(accountingPolicyEndpoints.vatRates)
      .then((response) => response.data),
};
