import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { edoService } from "../api";
import { edoQueryKeys } from "../constants/queryKeys";
import type {
  EdoOutboxSignRequestDto,
  EdoDocumentStatusDto,
} from "../types/type";

const pollingInterval = (query: { state: { data?: EdoDocumentStatusDto } }) =>
  query.state.data?.isTerminal ? false : 15_000;

export const useCreateEdoOutboxFactura = () =>
  useMutation({ mutationFn: edoService.createOutboxFactura });

export const useSignEdoOutbox = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: EdoOutboxSignRequestDto;
    }) => edoService.signOutbox(id, payload),
    onSuccess: (response) => {
      queryClient.setQueryData(
        edoQueryKeys.status("OUTBOX", response.document.id),
        response.document.status,
      );
    },
  });
};

export const useEdoDocumentStatus = (
  direction: "INBOX" | "OUTBOX",
  id: string | number,
  enabled = true,
) =>
  useQuery({
    queryKey: edoQueryKeys.status(direction, id),
    queryFn: () =>
      direction === "INBOX"
        ? edoService.inboxStatus(id)
        : edoService.outboxStatus(id),
    enabled: enabled && Boolean(id),
    refetchInterval: pollingInterval,
  });
