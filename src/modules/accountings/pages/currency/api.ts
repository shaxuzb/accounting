import { getJson, postJson } from "@/modules/accountings/services/request";
import { currencyEndpoints } from "./constants";
import type {
  CurrencyRate,
  Paged,
  RateOnDate,
  Revaluation,
  RevaluationRequest,
} from "./types";

export const currencyService = {
  rates: (params: object) =>
    getJson<Paged<CurrencyRate>>(currencyEndpoints.rates, params),
  rateOnDate: (currencyId: number, date: string) =>
    getJson<RateOnDate>(currencyEndpoints.rateOnDate, { currencyId, date }),
  importByDate: (date: string) =>
    postJson(currencyEndpoints.importByDate, { date }),
  revaluations: (params: object) =>
    getJson<Paged<Revaluation>>(currencyEndpoints.revaluations, params),
  revaluation: (id: number) =>
    getJson<Revaluation>(`${currencyEndpoints.revaluations}/${id}`),
  preview: (body: RevaluationRequest) =>
    postJson<Revaluation>(currencyEndpoints.revaluationPreview, body),
  create: (body: RevaluationRequest) =>
    postJson<Revaluation>(currencyEndpoints.revaluations, body),
  confirm: (id: number) => postJson(currencyEndpoints.revaluationConfirm(id)),
  cancel: (id: number) => postJson(currencyEndpoints.revaluationCancel(id)),
};
