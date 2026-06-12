import { productKeys } from "@/modules/warehouses/constants/queryKeys";
import { ProductQueryProps } from "@/modules/warehouses/types/warehouse";
import { useQuery } from "@tanstack/react-query";
import { productService } from "../services/productService";

export const useGetListProduct = (searchParams?: URLSearchParams) => {
  return useQuery<ProductQueryProps>({
    queryKey: [productKeys.GET_LIST, searchParams?.toString()],
    queryFn: () => productService.list(searchParams),
  });
};





