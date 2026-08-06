import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
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

export const useEdoFilePreview = (
  id: string | number,
  enabled = true,
) => {
  const query = useQuery({
    queryKey: edoQueryKeys.file(id),
    queryFn: () => edoService.downloadFile(id),
    enabled: enabled && Boolean(id),
    staleTime: 60_000,
    gcTime: 60_000,
  });
  const previewUrl = useMemo(
    () => (query.data ? URL.createObjectURL(query.data.blob) : undefined),
    [query.data],
  );

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  return { ...query, previewUrl };
};
