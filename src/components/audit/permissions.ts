export const auditPermissions = {
  recordHistory: "RECORD_HISTORY_VIEW",
  journal: "AUDIT_LOG_VIEW",
  userActivity: "USER_ACTIVITY_VIEW",
} as const;

export const canSeeRecordHistory = (permissions: string[]) =>
  permissions.includes(auditPermissions.recordHistory) || permissions.includes(auditPermissions.journal);
