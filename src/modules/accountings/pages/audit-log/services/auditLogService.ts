import { getJson } from "@/modules/accountings/services/request";
import { auditLogEndpoints } from "../constants/endpoints";
import type { AuditLogPage, AuditLogQuery } from "../types/type";

export const auditLogService = {
  list: (params: AuditLogQuery) => getJson<AuditLogPage>(auditLogEndpoints.list, params),
  tables: () => getJson<string[]>(auditLogEndpoints.tables),
};
