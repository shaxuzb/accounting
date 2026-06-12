import { purchaseEndpoint } from "@/modules/purchases/constants/endpoints";
import { $axiosPrivate } from "@/services/AxiosService";
import { QueryParams } from "@/types/api";

export const purchaseService = {
  list: async <TResponse = unknown>(searchParams?: QueryParams): Promise<TResponse> => {
    const query =
      searchParams instanceof URLSearchParams
        ? Object.fromEntries(searchParams)
        : (searchParams ?? {});

    const { data } = await $axiosPrivate.get(purchaseEndpoint.LIST, {
      params: {
        ...query,
        movementTypeId: 1,
      },
    });
    return data as TResponse;
  },
  detail: async <TResponse = unknown>(id: number): Promise<TResponse> => {
    const { data } = await $axiosPrivate.get(purchaseEndpoint.DETAIL(id));
    return data as TResponse;
  },
  create: async () => {},
  update: async () => {},
};



