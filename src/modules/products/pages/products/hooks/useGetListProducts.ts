import { useQuery } from "@tanstack/react-query";
import type { ListParams } from "@/shared/types";
import { productService } from "../api";
import { productKeys } from "../constants/queryKeys";

export const useGetListProducts = (params?: ListParams | URLSearchParams) =>
  useQuery({
    queryKey: productKeys.list(params?.toString?.() ?? params),
    queryFn: () => productService.list(params),
  });
