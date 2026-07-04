import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { cashDocumentEndpoints as endpoints } from "../constants/endpoints";
import type { CashDocument, CashDocumentKind } from "../types/type";
import type { CashDocumentForm } from "../types/form";

export const cashDocumentService = {
  list: (kind: CashDocumentKind, params?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<CashDocument>>(endpoints.list(kind), { params })
      .then((res) => res.data),
  detail: (kind: CashDocumentKind, id: string | number) =>
    $axiosPrivate
      .get<CashDocument>(endpoints.detail(kind, id))
      .then((res) => res.data),
  create: (kind: CashDocumentKind, payload: CashDocumentForm) =>
    $axiosPrivate
      .post<CashDocument>(endpoints.create(kind), payload)
      .then((res) => res.data),
  update: (
    kind: CashDocumentKind,
    id: string | number,
    payload: Partial<CashDocumentForm>,
  ) =>
    $axiosPrivate
      .put<CashDocument>(endpoints.update(kind, id), payload)
      .then((res) => res.data),
  confirm: (kind: CashDocumentKind, id: string | number) =>
    $axiosPrivate
      .put<CashDocument>(endpoints.confirm(kind, id))
      .then((res) => res.data),
  cancel: (kind: CashDocumentKind, id: string | number) =>
    $axiosPrivate
      .put<CashDocument>(endpoints.cancel(kind, id))
      .then((res) => res.data),
};
