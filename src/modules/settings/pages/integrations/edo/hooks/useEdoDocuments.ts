import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { edoService } from "../api";
import { edoQueryKeys } from "../constants/queryKeys";
import type {
  EdoAllDocumentsQueryDto,
  EdoOutboxQueryDto,
} from "../types/type";

export const useEdoOutbox = (params: EdoOutboxQueryDto, enabled = true) =>
  useQuery({
    queryKey: edoQueryKeys.outbox(params),
    queryFn: () => edoService.outbox(params),
    placeholderData: keepPreviousData,
    enabled,
  });

export const useEdoAllDocuments = (
  params: EdoAllDocumentsQueryDto,
  enabled = true,
) =>
  useQuery({
    queryKey: edoQueryKeys.allDocuments(params),
    queryFn: () => edoService.allDocuments(params),
    placeholderData: keepPreviousData,
    enabled,
  });

export const useEdoDocumentDetail = (
  id: string | number,
  enabled = true,
) =>
  useQuery({
    queryKey: edoQueryKeys.document(id),
    queryFn: () => edoService.document(id),
    enabled: enabled && Boolean(id),
    staleTime: 60_000,
  });

export const useEdoRemoteOutboxStatus = (
  providerDocumentId?: string | null,
  enabled = true,
) =>
  useQuery({
    queryKey: edoQueryKeys.remoteOutboxStatus(providerDocumentId ?? undefined),
    queryFn: () => edoService.remoteOutboxStatus(providerDocumentId ?? undefined),
    enabled: enabled && Boolean(providerDocumentId),
  });

export const useEdoInboxSummary = (enabled = true) =>
  useQuery({
    queryKey: edoQueryKeys.summary(),
    queryFn: edoService.inboxSummary,
    enabled,
    staleTime: 30_000,
  });
