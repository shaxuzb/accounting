import { $axiosPrivate } from "@/services/AxiosService";
import type { Paginated } from "@/shared/types";
import type { QueryParams } from "@/shared/types/api";
import { endpoints } from "./constants/endpoints";
import type { ChartAccounts } from "./types/type";
import type { ChartAccountsForm } from "./types/form";
import type {
  ChartAccountPresetAccountsPage,
  ChartAccountPresetAccount,
  CreateChartAccountsFromPresetItem,
} from "./types/preset";

type CollectionResponse<T> =
  | T[]
  | {
      items?: T[];
      results?: T[];
      data?:
        | T[]
        | {
            items?: T[];
            results?: T[];
            data?: T[];
            page?: number;
            pageSize?: number;
            totalCount?: number;
            totalPages?: number;
            hasPreviousPage?: boolean;
            hasNextPage?: boolean;
          };
      page?: number;
      pageSize?: number;
      totalCount?: number;
      totalPages?: number;
      hasPreviousPage?: boolean;
      hasNextPage?: boolean;
    };

const getCollection = <T>(response: CollectionResponse<T>) =>
  Array.isArray(response)
    ? response
    : Array.isArray(response.data)
      ? response.data
      : (response.items ??
        response.results ??
        response.data?.items ??
        response.data?.results ??
        response.data?.data ??
        []);

const getCollectionPage = <T>(
  response: CollectionResponse<T>,
): {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
} => {
  if (Array.isArray(response)) {
    return {
      items: response,
      page: 1,
      pageSize: response.length,
      totalCount: response.length,
      totalPages: response.length ? 1 : 0,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }

  const nested =
    !Array.isArray(response.data) && response.data ? response.data : undefined;
  const items = getCollection(response);
  const page = response.page ?? nested?.page ?? 1;
  const pageSize = response.pageSize ?? nested?.pageSize ?? items.length;
  const totalCount = response.totalCount ?? nested?.totalCount ?? items.length;
  const totalPages =
    response.totalPages ??
    nested?.totalPages ??
    (totalCount ? Math.ceil(totalCount / pageSize) : 0);

  return {
    items,
    page,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage:
      response.hasPreviousPage ?? nested?.hasPreviousPage ?? page > 1,
    hasNextPage:
      response.hasNextPage ?? nested?.hasNextPage ?? page < totalPages,
  };
};

export const chartAccountsService = {
  list: (params?: QueryParams) =>
    $axiosPrivate
      .get<Paginated<ChartAccounts>>(endpoints.list, { params })
      .then((res) => res.data),
  detail: (id: string | number) =>
    $axiosPrivate
      .get<ChartAccounts>(endpoints.detail(id))
      .then((res) => res.data),
  create: (payload: ChartAccountsForm) => {
    const {
      organizationId: _organizationId,
      stateId: _stateId,
      subkontoTypeIds: _subkontoTypeIds,
      ...createPayload
    } = payload;
    return $axiosPrivate
      .post<ChartAccounts>(endpoints.create, {
        ...createPayload,
      })
      .then((res) => res.data);
  },
  update: (id: string | number, payload: Partial<ChartAccountsForm>) =>
    $axiosPrivate
      .put<ChartAccounts>(endpoints.update(id), payload)
      .then((res) => res.data),
  presetAccounts: (params?: QueryParams) =>
    $axiosPrivate
      .get<
        CollectionResponse<ChartAccountPresetAccount>
      >(endpoints.presetAccountsGrouped, { params })
      .then(
        (res) => getCollectionPage(res.data) as ChartAccountPresetAccountsPage,
      ),
  createFromPreset: (payload: CreateChartAccountsFromPresetItem[]) =>
    $axiosPrivate
      .post<ChartAccounts[]>(endpoints.createFromPreset, payload)
      .then((res) => res.data),
};
