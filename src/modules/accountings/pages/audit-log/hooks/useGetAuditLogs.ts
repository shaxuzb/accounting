import { useQuery } from "@tanstack/react-query";
import { auditLogKeys } from "../constants/queryKeys";
import { auditLogService } from "../services/auditLogService";
import type { AuditLogQuery } from "../types/type";

export const useGetAuditLogs = (params?: AuditLogQuery) =>
  useQuery({
    queryKey: auditLogKeys.list(params),
    queryFn: () => auditLogService.list(params!),
    enabled: Boolean(params),
  });
