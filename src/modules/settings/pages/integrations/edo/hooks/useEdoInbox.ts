import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { edoService } from "../api";
import { edoQueryKeys } from "../constants/queryKeys";
import type {
  EdoInboxQueryDto,
  EdoInboxRejectRequestDto,
} from "../types/type";

export const useEdoInbox = (params: EdoInboxQueryDto, enabled = true) =>
  useQuery({
    queryKey: edoQueryKeys.inbox(params),
    queryFn: () => edoService.inbox(params),
    placeholderData: keepPreviousData,
    enabled,
  });

export const useRejectEdoInbox = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: EdoInboxRejectRequestDto;
    }) => edoService.rejectInbox(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: edoQueryKeys.inboxes() });
    },
  });
};

export const useDownloadEdoFile = () =>
  useMutation({ mutationFn: edoService.downloadFile });
