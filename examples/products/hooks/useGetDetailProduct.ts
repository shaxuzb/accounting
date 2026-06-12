import { useQuery } from "@tanstack/react-query";
import { productKeys } from "@/modules/warehouses/constants/queryKeys";
import { productService } from "../services/productService";
import { ProductData } from "@/modules/warehouses/types/warehouse";

export const useGetDetailProduct = (id: number) => {
  return useQuery<ProductData>({
    queryKey: [productKeys.GET_DETAIL, id],
    queryFn: () => productService.detail(id),
    enabled: !!id,
  });
};





