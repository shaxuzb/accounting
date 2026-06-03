import { useQuery } from "@tanstack/react-query";
import { authKeys } from "../constants/queryKeys";
import { authService } from "../services/authService";

export const useGetDetailAuth = (id: string | number) =>
  useQuery({
    queryKey: authKeys.auth.detail(id),
    queryFn: () => authService.detail(id),
    enabled: Boolean(id),
  });
