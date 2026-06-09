import { useQuery } from "@tanstack/react-query";
import { settingsKeys } from "../../constants/queryKeys";
import { counterpartyService } from "../../services/counterpartyService";

export const useGetDetailCounteryParty = (id: string | number) =>
  useQuery({
    queryKey: settingsKeys.counterparty.detail(id),
    queryFn: () => counterpartyService.detail(id),
    enabled: Boolean(id),
  });
