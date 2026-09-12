import type { PayrollHrOrderType } from "@/modules/payroll/constants/options";

export interface HrOrderFieldConfig {
  showDepartment: boolean;
  showPosition: boolean;
  showEmployment: boolean;
  showSalary: boolean;
  showRate: boolean;
  showWeeklyHours: boolean;
  showCurrency: boolean;
  showExpenseAccount: boolean;
  showAdvance: boolean;
}

const FULL_TARGET_FIELDS: HrOrderFieldConfig = {
  showDepartment: true,
  showPosition: true,
  showEmployment: true,
  showSalary: true,
  showRate: true,
  showWeeklyHours: true,
  showCurrency: true,
  showExpenseAccount: true,
  showAdvance: true,
};

export const getHrOrderFieldConfig = (
  orderType: PayrollHrOrderType,
): HrOrderFieldConfig => {
  if (orderType === "DISMISSAL") {
    return {
      showDepartment: false,
      showPosition: false,
      showEmployment: false,
      showSalary: false,
      showRate: false,
      showWeeklyHours: false,
      showCurrency: false,
      showExpenseAccount: false,
      showAdvance: false,
    };
  }
  if (orderType === "PAY_CHANGE") {
    return { ...FULL_TARGET_FIELDS, showDepartment: false, showPosition: false, showEmployment: false, showWeeklyHours: false, showCurrency: false, showExpenseAccount: false, showAdvance: false };
  }
  if (orderType === "TRANSFER") {
    return { ...FULL_TARGET_FIELDS, showSalary: false, showRate: false, showWeeklyHours: false, showCurrency: false, showExpenseAccount: false, showAdvance: false };
  }
  return { ...FULL_TARGET_FIELDS };
};

export interface HrOrderTargetValues {
  orderType: PayrollHrOrderType;
  departmentId?: number | null;
  positionId?: number | null;
  monthlySalary?: number | null;
  employmentType?: string | null;
  currencyId?: number | null;
}

export const validateHrOrderTarget = (values: HrOrderTargetValues) => {
  if (values.orderType === "TRANSFER") {
    return {
      valid: Boolean(values.departmentId || values.positionId),
      code: "departmentOrPositionRequired" as const,
    };
  }
  if (values.orderType === "PAY_CHANGE") {
    return {
      valid: values.monthlySalary != null && values.monthlySalary >= 0,
      code: "monthlySalaryRequired" as const,
    };
  }
  if (values.orderType === "HIRE") {
    const valid =
      Boolean(values.departmentId || values.positionId) &&
      values.monthlySalary != null &&
      values.monthlySalary >= 0 &&
      Boolean(values.currencyId) &&
      Boolean(values.employmentType);
    return { valid, code: "hireFieldsRequired" as const };
  }
  return { valid: true, code: undefined };
};
