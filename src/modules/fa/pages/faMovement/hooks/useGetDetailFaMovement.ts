import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../constants/queryKeys";
import { faMovementService } from "../api";

export const useGetDetailFaMovement = (id: string | number) =>
  useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => faMovementService.detail(id),
    enabled: Boolean(id),
  });
