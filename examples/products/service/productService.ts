import { productsEndpoint } from "@/modules/warehouses/constants/endpoints";
import { $axiosPrivate } from "@/services/AxiosService";
import { QueryParams } from "@/types/api";

export const productService = {
  list: async <TResponse = unknown>(searchParams?: QueryParams): Promise<TResponse> => {
    const { data } = await $axiosPrivate.get(productsEndpoint.LIST, {
      params: searchParams,
    });
    return data as TResponse;
  },
  detail: async <TResponse = unknown>(id: number): Promise<TResponse> => {
    const { data } = await $axiosPrivate.get(productsEndpoint.DETAIL(id));
    return data as TResponse;
  },
  summary: async <TResponse = unknown>(searchParams?: QueryParams): Promise<TResponse> => {
    const { data } = await $axiosPrivate.get(productsEndpoint.SUMMARY, {
      params: searchParams,
    });
    return data as TResponse;
  },
  create: async <TPayload = unknown, TResponse = unknown>(values: TPayload): Promise<TResponse> => {
    const { data } = await $axiosPrivate.post(productsEndpoint.CREATE, values);
    return data as TResponse;
  },
  update: async <TPayload = unknown, TResponse = unknown>(id: number, values: TPayload): Promise<TResponse> => {
    const { data } = await $axiosPrivate.put(productsEndpoint.UPDATE(id), values);
    return data as TResponse;
  },
};



