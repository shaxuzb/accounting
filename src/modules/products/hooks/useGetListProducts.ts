import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ListParams } from "@/shared/types";
import { productsKeys } from "../constants/queryKeys";
import { productsService } from "../services/productsService";

export const useGetListProducts = (params?: ListParams) =>
  useQuery({
    queryKey: productsKeys.products.list(params),
    queryFn: () => productsService.list(params),
    placeholderData: keepPreviousData,
  });
