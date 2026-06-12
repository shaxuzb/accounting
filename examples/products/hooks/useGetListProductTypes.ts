import { productTypeKeys } from "@/modules/warehouses/constants/queryKeys";
import { ProductTypeQueryProps } from "@/modules/warehouses/types/warehouse";
import { useQuery } from "@tanstack/react-query";
import { productTypeService } from "../services/productTypeService";

export const useGetListProductTypes = (searchParams?: URLSearchParams) => {
  return useQuery<ProductTypeQueryProps>({
    queryKey: [productTypeKeys.GET_LIST, searchParams?.toString()],
    queryFn: () => productTypeService.list(searchParams),
  });
};





