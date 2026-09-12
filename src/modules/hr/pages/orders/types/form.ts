import type {
  PayrollAdvanceMethod,
  PayrollEmploymentType,
  PayrollHrOrderType,
} from "@/modules/payroll/constants/options";

export interface PayrollHrOrderForm {
  orderDate: string;
  orderType: PayrollHrOrderType;
  employeeId: number | null;
  effectiveDate: string;
  basis: string | null;
  note: string | null;
  departmentId: number | null;
  positionId: number | null;
  employmentType: PayrollEmploymentType | null;
  monthlySalary: number | null;
  employmentRate: number | null;
  weeklyHours: number | null;
  currencyId: number | null;
  expenseAccountId: number | null;
  advanceMethod: PayrollAdvanceMethod;
  advanceValue: number | null;
}
