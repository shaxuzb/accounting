export interface HrAbsenceForm {
  employeeId: number | null;
  absenceTypeId: number | null;
  docDate: string;
  startDate: string;
  endDate: string;
  note: string | null;
}
