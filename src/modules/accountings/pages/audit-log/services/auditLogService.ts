import { getJson } from "@/modules/accountings/services/request";
import { auditLogEndpoints } from "../constants/endpoints";
import type { AuditLogQuery, AuditLogResult } from "../types/type";

export const auditLogService = {
  list: (params: AuditLogQuery) =>
    getJson<AuditLogResult>(auditLogEndpoints.list, params),
};
