import type { PayrollPeriodStatus } from "../../../constants/options";

export interface PayrollPeriod {
  id: number;
  year: number;
  month: number;
  monthName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  normWorkDays: number;
  normWorkHours: number;
  status: PayrollPeriodStatus;
  statusName?: string | null;
  closedDate?: string | null;
  createdDate?: string | null;
}
