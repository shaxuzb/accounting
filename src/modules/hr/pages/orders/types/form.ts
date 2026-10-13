import type {
  PayrollAdvanceMethod,
  PayrollEmploymentType,
  PayrollHrOrderType,
} from "@/modules/payroll/constants/options";

/** A planned accrual line of the order (1C «Плановые начисления»). */
export interface PayrollHrOrderComponentLine {
  componentId: number | null;
  action: "ASSIGN" | "END";
  amount: number | null;
  rate: number | null;
}

export interface PayrollHrOrderForm {
  orderDate: string;
  orderType: PayrollHrOrderType;
  employeeId: number | null;
  effectiveDate: string;
  basis: string | null;
  note: string | null;
  /** DISMISSAL: the ground (MK article), required to confirm */
  dismissalGround: string | null;
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
  components: PayrollHrOrderComponentLine[];
}
