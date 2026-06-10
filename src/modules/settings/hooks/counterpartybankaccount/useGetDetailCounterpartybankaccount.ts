import { useQuery } from "@tanstack/react-query";
import { settingsKeys } from "../../constants/queryKeys";
import { counterpartybankaccountService } from "../../services/counterpartybankaccountService";

export const useGetDetailCounterpartybankaccount = (id: string | number) =>
  useQuery({
    queryKey: settingsKeys.counterpartyBankAccount.detail(id),
    queryFn: () => counterpartybankaccountService.detail(id),
    enabled: Boolean(id),
  });
