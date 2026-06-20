import { useMutation } from "@tanstack/react-query";
import { saleProductLookupService } from "../services/saleProductLookupService";

export const useBarcodeProduct = () =>
  useMutation({
    mutationFn: (markingNumber: string) =>
      saleProductLookupService.byMarking(markingNumber),
  });
