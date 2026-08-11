import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { bankStatementEndpoints } from "../constants/endpoints";
import type { BankOperationData } from "../types/type";
import type {
  BankCounterpartiesCreatePayload,
  BankOperationCreatePayload,
  BankOperationsCreatePayload,
} from "../types/form";

type UnknownRecord = Record<string, unknown>;

const toRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};

const toNumber = (value: unknown, fallback: number) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

const normalizeBankOperationList = (
  value: unknown,
): Paginated<BankOperationData> => {
  const response = toRecord(value);
  const nested = toRecord(response.data ?? response.result);
  const root = Object.keys(nested).length > 0 ? nested : response;
  const rawItems = root.items ?? root.results ?? root.rows;
  const items = Array.isArray(rawItems)
    ? (rawItems as BankOperationData[])
    : [];

  return {
    items,
    total: toNumber(root.total ?? root.totalCount ?? root.count, items.length),
    page: toNumber(root.page ?? root.pageNumber, 1),
    pageSize: toNumber(root.pageSize, items.length),
  };
};

export const bankStatementParserService = {
  parse: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await $axiosPrivate.post<unknown>(
      bankStatementEndpoints.parser.parse,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return data;
  },
  listOperations: async (params?: QueryParams) => {
    const { data } = await $axiosPrivate.get<unknown>(
      bankStatementEndpoints.operations.list,
      { params },
    );
    return normalizeBankOperationList(data);
  },
  detailOperation: async (id: string | number) => {
    const { data } = await $axiosPrivate.get<BankOperationData>(
      bankStatementEndpoints.operations.detail(id),
    );
    return data;
  },
  createManyOperations: async (payload: BankOperationsCreatePayload) => {
    const { data } = await $axiosPrivate.post<BankOperationData[]>(
      bankStatementEndpoints.operations.createMany,
      payload,
    );
    return data;
  },
  createManyCounterparties: async (
    payload: BankCounterpartiesCreatePayload,
  ) => {
    const { data } = await $axiosPrivate.post<unknown>(
      bankStatementEndpoints.counterpartyCards.createMany,
      payload,
    );
    return data;
  },
  createOperation: async (
    payload: BankOperationCreatePayload,
  ) => {
    const { data } = await $axiosPrivate.post<BankOperationData>(
      bankStatementEndpoints.operations.create,
      payload,
    );
    return data;
  },
  updateOperation: async (
    id: string | number,
    payload: BankOperationCreatePayload,
  ) => {
    const { data } = await $axiosPrivate.put<BankOperationData>(
      bankStatementEndpoints.operations.update(id),
      payload,
    );
    return data;
  },
  confirmOperation: async (id: string | number) => {
    const { data } = await $axiosPrivate.post<BankOperationData>(
      bankStatementEndpoints.operations.confirm(id),
    );
    return data;
  },
  cancelOperation: async (id: string | number) => {
    const { data } = await $axiosPrivate.post<BankOperationData>(
      bankStatementEndpoints.operations.cancel(id),
    );
    return data;
  },
};
