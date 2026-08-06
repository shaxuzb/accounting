import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { edoService } from "../api";
import { edoQueryKeys } from "../constants/queryKeys";
import { clearCurrentEdoAuthSessions } from "../utils/authSession";

export const useEdoActiveProvider = () =>
  useQuery({
    queryKey: edoQueryKeys.activeProvider(),
    queryFn: edoService.activeProvider,
    retry: false,
  });

export const useSetEdoActiveProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: edoService.setActiveProvider,
    onSuccess: () => {
      clearCurrentEdoAuthSessions();
      void queryClient.invalidateQueries({ queryKey: edoQueryKeys.all });
    },
  });
};
