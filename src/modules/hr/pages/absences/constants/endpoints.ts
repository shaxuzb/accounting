export const hrAbsenceEndpoints = {
  list: "hr/absences",
  types: "hr/absences/types",
  detail: (id: string | number) => `hr/absences/${id}`,
  attachments: (id: string | number) => `hr/absences/${id}/attachments`,
  attachment: (id: string | number, attachmentId: string | number) =>
    `hr/absences/${id}/attachments/${attachmentId}`,
} as const;
