import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import type { Contract } from "../types/type";
import type { ContractForm } from "../types/form";
import { contractEndpoints } from "../constants/endpoints";

type UnknownRecord = Record<string, unknown>;

const toRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};

const toNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeContract = (value: unknown): Contract => {
  const contract = toRecord(value);

  return {
    ...contract,
    contractTypeName: String(
      contract.contractTypeName ?? contract.contractType ?? "",
    ),
  } as unknown as Contract;
};

const normalizeContractList = (value: unknown): Paginated<Contract> => {
  const response = toRecord(value);
  const nested = toRecord(response.data ?? response.result);
  const root = Object.keys(nested).length ? nested : response;
  const rawItems = Array.isArray(value)
    ? value
    : Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.result)
        ? response.result
        : root.items ?? root.results ?? root.rows;
  const items = Array.isArray(rawItems)
    ? rawItems.map(normalizeContract)
    : [];

  return {
    items,
    total: toNumber(root.total ?? root.count ?? root.totalCount, items.length),
    page: toNumber(root.page ?? root.pageNumber, 1),
    pageSize: toNumber(root.pageSize, items.length),
  };
};

export const contractService = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<unknown>(contractEndpoints.contract.list, { params })
      .then((res) => normalizeContractList(res.data)),
  detail: (id: string | number) =>
    $axiosPrivate
      .get<Contract>(contractEndpoints.contract.detail(id))
      .then((res) => res.data),
  create: (payload: ContractForm) =>
    $axiosPrivate
      .post<Contract>(contractEndpoints.contract.create, payload)
      .then((res) => res.data),
  update: (id: string | number, payload: Partial<ContractForm>) =>
    $axiosPrivate
      .put<Contract>(contractEndpoints.contract.update(id), payload)
      .then((res) => res.data),
};
