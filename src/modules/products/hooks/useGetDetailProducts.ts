import { useQuery } from "@tanstack/react-query";
import { productsKeys } from "../constants/queryKeys";
import { productsService } from "../services/productsService";

export const useGetDetailProducts = (id: string | number) =>
  useQuery({
    queryKey: productsKeys.products.detail(id),
    queryFn: () => productsService.detail(id),
    enabled: Boolean(id),
  });
