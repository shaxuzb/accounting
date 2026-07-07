import type { AuditLogQuery } from "../types/type";

export const auditLogKeys = {
  all: ["accountings", "audit-log"] as const,
  list: (params?: AuditLogQuery) => [...auditLogKeys.all, params] as const,
};
