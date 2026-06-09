import { useQuery } from "@tanstack/react-query";
import { settingsKeys } from "../../constants/queryKeys";
import { counterpartyService } from "../../services/counterpartyService";

export const useGetListCounterparty = (params?: URLSearchParams) =>
  useQuery({
    queryKey: settingsKeys.counterparty.list(params),
    queryFn: () => counterpartyService.list(params as any),
    // placeholderData: keepPreviousData,
  });





  