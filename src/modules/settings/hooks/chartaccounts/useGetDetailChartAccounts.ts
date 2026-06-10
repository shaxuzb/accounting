import { useQuery } from "@tanstack/react-query";
import { settingsKeys } from "../../constants/queryKeys";
import { chartAccountsService } from "../../services/chartAccountsService";

export const useGetDetailChartAccounts = (id: string | number) =>
  useQuery({
    queryKey: settingsKeys.chartAccounts.detail(id),
    queryFn: () => chartAccountsService.detail(id),
    enabled: Boolean(id),
  });
