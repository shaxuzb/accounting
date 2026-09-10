import type { PayrollPeriodStatus } from "../../../constants/options";
import type { PayrollPeriodCalendarDayForm } from "./form";

export interface PayrollPeriod {
  id: number;
  year: number;
  month: number;
  monthName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  dailyWorkHours: number;
  workDates?: string[];
  calendarDays?: PayrollPeriodCalendarDayForm[];
  normWorkDays: number;
  normWorkHours: number;
  status: PayrollPeriodStatus;
  statusName?: string | null;
  closedDate?: string | null;
  createdDate?: string | null;
  isUsedInTimesheet: boolean;
  canEdit: boolean;
  editBlockedReason?: string | null;
}
