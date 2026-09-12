import type {
  PayrollAdvanceMethod,
  PayrollEmploymentType,
  PayrollHrOrderType,
} from "@/modules/payroll/constants/options";

export interface PayrollHrOrder {
  id: number;
  orderNumber: string;
  orderDate: string;
  orderType: PayrollHrOrderType;
  employeeId: number;
  employeeName: string;
  effectiveDate: string;
  statusId: number;
  basis?: string | null;
  note?: string | null;
  departmentId?: number | null;
  departmentName?: string | null;
  positionId?: number | null;
  positionName?: string | null;
  employmentType?: PayrollEmploymentType | null;
  monthlySalary?: number | null;
  employmentRate?: number | null;
  weeklyHours?: number | null;
  currencyId?: number | null;
  currencyName?: string | null;
  expenseAccountId?: number | null;
  expenseAccountNumber?: string | null;
  advanceMethod?: PayrollAdvanceMethod | null;
  advanceValue?: number | null;
  employmentId?: number | null;
  createdDate?: string | null;
  updatedDate?: string | null;
  confirmedDate?: string | null;
}

export type PayrollHrOrderListItem = Pick<
  PayrollHrOrder,
  | "id"
  | "orderNumber"
  | "orderDate"
  | "orderType"
  | "employeeId"
  | "employeeName"
  | "effectiveDate"
  | "statusId"
  | "positionId"
  | "positionName"
  | "monthlySalary"
  | "departmentName"
>;

export interface PayrollHrOrderPrint {
  id: number;
  orderNumber: string;
  orderDate: string;
  orderType: PayrollHrOrderType;
  effectiveDate: string;
  statusId: number;
  basis?: string | null;
  note?: string | null;
  organizationName: string;
  employeeId: number;
  employeeNumber: string;
  employeeName: string;
  pinfl?: string | null;
  fromDepartmentName?: string | null;
  fromPositionName?: string | null;
  fromMonthlySalary?: number | null;
  toDepartmentName?: string | null;
  toPositionName?: string | null;
  toMonthlySalary?: number | null;
  currencyName?: string | null;
  employmentRate?: number | null;
  confirmedByName?: string | null;
  confirmedDate?: string | null;
}
