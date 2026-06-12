import { productTypeEndpoint } from "@/modules/warehouses/constants/endpoints";
import { $axiosPrivate } from "@/services/AxiosService";
import { QueryParams } from "@/types/api";

export const productTypeService = {
  list: async <TResponse = unknown>(searchParams?: QueryParams): Promise<TResponse> => {
    const { data } = await $axiosPrivate.get(productTypeEndpoint.LIST, {
      params: searchParams,
    });
    return data as TResponse;
  },
  getImages: async <TResponse = unknown>(id: number): Promise<TResponse> => {
    const { data } = await $axiosPrivate.get(productTypeEndpoint.GET_IMAGES(id));
    return data as TResponse;
  },
  detail: async <TResponse = unknown>(id: number): Promise<TResponse> => {
    const { data } = await $axiosPrivate.get(productTypeEndpoint.DETAIL(id));
    return data as TResponse;
  },
  create: async <TPayload = unknown, TResponse = unknown>(values: TPayload): Promise<TResponse> => {
    const { data } = await $axiosPrivate.post(productTypeEndpoint.CREATE, values);
    return data as TResponse;
  },
  update: async <TPayload = unknown, TResponse = unknown>(id: number, values: TPayload): Promise<TResponse> => {
    const { data } = await $axiosPrivate.put(productTypeEndpoint.UPDATE(id), values);
    return data as TResponse;
  },
  uploadImage: async <TPayload = unknown, TResponse = unknown>(id: number, values: TPayload): Promise<TResponse> => {
    const { data } = await $axiosPrivate.post(productTypeEndpoint.UPLOAD_IMAGE(id), values);
    return data as TResponse;
  },
};



