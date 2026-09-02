import { useQuery } from "@tanstack/react-query";
import { paymentAcceptancePointService } from "../api";
import { queryKeys } from "../constants/queryKeys";

export const useGetListPaymentAcceptancePoints = (params?: URLSearchParams) =>
  useQuery({
    queryKey: queryKeys.list(params?.toString()),
    queryFn: () => paymentAcceptancePointService.list(params),
  });
