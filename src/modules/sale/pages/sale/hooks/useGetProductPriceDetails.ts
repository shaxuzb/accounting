import { useMutation } from "@tanstack/react-query";
import { productPriceService } from "../services/productPriceService";

export const useGetProductPriceDetails = () =>
  useMutation({
    mutationFn: (productId: string | number) =>
      productPriceService.details(productId),
  });
