import * as Yup from "yup";
import { tMessage, requiredNumber, requiredString } from "@/modules/settings/shared/validation";

export const hrOrderSchema = Yup.object({
  orderDate: requiredString("payroll.fields.orderDate"),
  orderType: requiredString("payroll.fields.orderType"),
  employeeId: requiredNumber("payroll.fields.employee"),
  effectiveDate: requiredString("payroll.fields.effectiveDate"),
  basis: Yup.string().nullable(),
  note: Yup.string().nullable(),
  departmentId: Yup.number().nullable(),
  positionId: Yup.number().nullable(),
  employmentType: Yup.string().nullable(),
  monthlySalary: Yup.number().nullable().min(0, () => tMessage("payroll.messages.notNegative")),
  employmentRate: Yup.number().nullable().moreThan(0, () => tMessage("payroll.messages.rateRange")).max(2, () => tMessage("payroll.messages.rateRange")),
  weeklyHours: Yup.number().nullable().moreThan(0, () => tMessage("payroll.messages.weeklyHoursRange")).max(168, () => tMessage("payroll.messages.weeklyHoursRange")),
  currencyId: Yup.number().nullable(),
  expenseAccountId: Yup.number().nullable(),
  advanceMethod: requiredString("payroll.fields.advanceMethod"),
  advanceValue: Yup.number().nullable().min(0, () => tMessage("payroll.messages.notNegative")),
}).test("order-target", function (values) {
  const data = values as {
    orderType?: string;
    departmentId?: number | null;
    positionId?: number | null;
    monthlySalary?: number | null;
    currencyId?: number | null;
    employmentType?: string | null;
  } | undefined;
  if (!data) return true;
  const hasOrgTarget = Boolean(data.departmentId || data.positionId);
  if (data.orderType === "TRANSFER" && !hasOrgTarget) {
    return this.createError({ path: "positionId", message: tMessage("payroll.messages.orderDepartmentOrPositionRequired") });
  }
  if (data.orderType === "HIRE" && (!hasOrgTarget || data.monthlySalary == null || !data.currencyId || !data.employmentType)) {
    return this.createError({ path: "positionId", message: tMessage("payroll.messages.orderHireFieldsRequired") });
  }
  if (data.orderType === "PAY_CHANGE" && (data.monthlySalary == null || data.monthlySalary < 0)) {
    return this.createError({ path: "monthlySalary", message: tMessage("payroll.messages.monthlySalaryRequired") });
  }
  return true;
});
