import { useQuery } from "@tanstack/react-query";
import { contractKeys } from "../constants/queryKeys";
import { contractService } from "../services/contractService";

export const useGetDetailContract = (id: string | number) =>
  useQuery({
    queryKey: contractKeys.contract.detail(id),
    queryFn: () => contractService.detail(id),
    enabled: Boolean(id),
  });
