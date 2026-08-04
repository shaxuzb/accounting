import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { edoService } from "../api";
import { edoQueryKeys } from "../constants/queryKeys";

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
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: edoQueryKeys.all }),
  });
};
