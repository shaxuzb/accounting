import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { counterpartycontactService } from "../api";


export const useGetDetailCounterpartycontact = (id: string | number) =>
  useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => counterpartycontactService.detail(id),
    enabled: Boolean(id),
  });
