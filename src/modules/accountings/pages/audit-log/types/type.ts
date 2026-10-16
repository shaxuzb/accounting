export interface AuditLogQuery {
  fromDate?: string | null;
  toDate?: string | null;
  changedUserId?: number | null;
  tableName?: string | null;
  recordId?: string | null;
  action?: string | null;
  search?: string | null;
  page?: number;
  pageSize?: number;
}

export interface AuditLogChange {
  path?: string | null;
  oldValue?: unknown;
  newValue?: unknown;
}

export interface AuditLogItem {
  id: number;
  tableName: string;
  recordId?: string | null;
  action: string;
  changedUserId?: number | null;
  changedUserName?: string | null;
  changedDate: string;
  changeResults: AuditLogChange[];
}

export interface AuditLogPage {
  items: AuditLogItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}
