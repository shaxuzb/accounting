import { errorHandlers } from "@/shared/utils/helpers/errorHandlers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "../services/productService";
import { productKeys } from "@/modules/warehouses/constants/queryKeys";

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: unknown) => productService.create(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [productKeys.GET_LIST] });
      qc.invalidateQueries({ queryKey: [productKeys.GET_DETAIL] });
    },
    onError: (err) => {
      errorHandlers(err);
    },
  });
};






