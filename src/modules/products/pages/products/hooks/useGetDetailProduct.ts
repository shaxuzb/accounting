import { useQuery } from "@tanstack/react-query";
import { productService } from "../api";
import { productKeys } from "../constants/queryKeys";

export const useGetDetailProduct = (id?: string | number) =>
  useQuery({
    queryKey: productKeys.detail(id ?? ""),
    queryFn: () => productService.detail(id ?? ""),
    enabled: Boolean(id),
  });
