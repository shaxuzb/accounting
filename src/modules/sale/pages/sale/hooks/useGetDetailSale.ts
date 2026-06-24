import { useQuery } from "@tanstack/react-query";
import { saleKeys } from "../constants/queryKeys";
import { saleDocService } from "../services/saleDocService";
import { saleDocTableService } from "../services/saleDocTableService";

export const useGetDetailSale = (id: string | number) =>
  useQuery({
    queryKey: saleKeys.saleDoc.detail(id),
    queryFn: () => saleDocService.detail(id),
    enabled: Boolean(id),
  });

export const useGetSaleLines = (
  ownerId: string | number,
  enabled = true,
) =>
  useQuery({
    queryKey: saleKeys.saleDocTable.list(ownerId),
    queryFn: () => saleDocTableService.list(),
    enabled: Boolean(ownerId) && enabled,
  });
