import { errorHandlers } from "@/shared/utils/helpers/errorHandlers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productTypeKeys } from "@/modules/warehouses/constants/queryKeys";
import { productTypeService } from "../services/productTypeService";

export const useCreateProductTypes = () => {
  const qc = useQueryClient();
  return useMutation<unknown, unknown, unknown>({
    mutationFn: (values: unknown) => productTypeService.create(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [productTypeKeys.GET_LIST] });
      qc.invalidateQueries({ queryKey: [productTypeKeys.GET_DETAIL] });
    },
    onError: (err) => {
      errorHandlers(err);
    },
  });
};






