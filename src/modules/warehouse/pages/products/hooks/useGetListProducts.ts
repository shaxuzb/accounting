import { useQuery } from "@tanstack/react-query";
import { productService } from "../api";
import { productKeys } from "../constants/queryKeys";

export const useGetListProducts = (
  params?: URLSearchParams | Record<string, unknown>,
) =>
  useQuery({
    queryKey: productKeys.list(
      params instanceof URLSearchParams ? params.toString() : params,
    ),
    queryFn: () => productService.list(params),
  });
