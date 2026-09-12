export const payrollDocumentEndpoints = {
  list: "payroll/documents",
  detail: (id: string | number) => `payroll/documents/${id}`,
  correctionBasis: (id: string | number) => `payroll/documents/${id}/correction-basis`,
  updateDraft: (id: string | number) => `payroll/documents/${id}/draft`,
  calculate: "payroll/documents/calculate",
  recalculate: (id: string | number) => `payroll/documents/${id}/recalculate`,
  confirm: (id: string | number) => `payroll/documents/${id}/confirm`,
  cancel: (id: string | number) => `payroll/documents/${id}/cancel`,
  delete: (id: string | number) => `payroll/documents/${id}`,
} as const;
