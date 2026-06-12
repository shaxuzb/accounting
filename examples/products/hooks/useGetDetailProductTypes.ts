import { useQuery } from "@tanstack/react-query";
import { productTypeKeys } from "@/modules/warehouses/constants/queryKeys";
import { ProductTypeData } from "@/modules/warehouses/types/warehouse";
import { productTypeService } from "../services/productTypeService";

export const useGetDetailProductTypes = (id: number) => {
  return useQuery<ProductTypeData>({
    queryKey: [productTypeKeys.GET_DETAIL, id],
    queryFn: () => productTypeService.detail(id),
    enabled: !!id,
  });
};





