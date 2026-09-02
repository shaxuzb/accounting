import { useQuery } from "@tanstack/react-query";
import { paymentAcceptancePointService } from "../api";
import { queryKeys } from "../constants/queryKeys";

export const useGetDetailPaymentAcceptancePoint = (id: string | number) =>
  useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => paymentAcceptancePointService.detail(id),
    enabled: Boolean(id),
  });
