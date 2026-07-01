import { useQuery } from "@tanstack/react-query";
import { productService } from "../api";
import { productKeys } from "../constants/queryKeys";

export const useGetDetailProduct = (
  id?: string | number,
  isService?: boolean,
) =>
  useQuery({
    queryKey: [...productKeys.detail(id ?? ""), isService] as const,
    queryFn: () => productService.detail(id ?? "", isService),
    enabled: Boolean(id),
  });
