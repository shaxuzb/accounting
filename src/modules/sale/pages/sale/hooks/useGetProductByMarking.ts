import { useMutation } from "@tanstack/react-query";
import { productTableService } from "../services/productTableService";

export const useGetProductByMarking = () =>
  useMutation({
    mutationFn: (markingNumber: string) =>
      productTableService.getByMarking(markingNumber),
  });
