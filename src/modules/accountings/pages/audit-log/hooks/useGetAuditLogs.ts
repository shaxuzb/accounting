import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { auditLogKeys } from "../constants/queryKeys";
import { auditLogService } from "../services/auditLogService";
import type { AuditLogQuery } from "../types/type";

export const useGetAuditLogs = (params: AuditLogQuery) =>
  useQuery({
    queryKey: auditLogKeys.list(params),
    queryFn: () => auditLogService.list(params),
    placeholderData: keepPreviousData,
  });

export const useGetAuditLogTables = () =>
  useQuery({
    queryKey: auditLogKeys.tables(),
    queryFn: () => auditLogService.tables(),
    staleTime: 5 * 60 * 1000,
  });
