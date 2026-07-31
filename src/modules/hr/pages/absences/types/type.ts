export interface HrAbsenceType {
  id: number;
  code?: string | null;
  name: string;
}

export interface HrAbsenceAttachment {
  id: number;
  originalFileName: string;
  contentType?: string | null;
  fileSize?: number | null;
  createdDate?: string | null;
  downloadUrl?: string | null;
}

export interface HrAbsence {
  id: number;
  organizationId?: number | null;
  stateId?: number | null;
  docNumber?: string | null;
  docDate?: string | null;
  employeeId: number;
  employeeNumber?: string | null;
  employeeName?: string | null;
  absenceTypeId: number;
  absenceTypeCode?: string | null;
  absenceTypeName?: string | null;
  startDate: string;
  endDate: string;
  calendarDays?: number | null;
  attachmentCount?: number | null;
  note?: string | null;
  attachments?: HrAbsenceAttachment[];
  statusCode?: string | null;
  statusName?: string | null;
  createdDate?: string | null;
  updatedDate?: string | null;
}
