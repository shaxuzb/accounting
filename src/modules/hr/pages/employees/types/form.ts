import type { HrWorkScheduleDay } from "./type";

export interface HrWorkScheduleForm {
  name: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  days: HrWorkScheduleDay[];
}
