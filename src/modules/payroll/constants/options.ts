import type { StaticOption } from "@/components/fields/SelectStatic";

/* ------------------------------------------------------------------ */
/* Hujjat holatlari (backend statusId)                                  */
/* ------------------------------------------------------------------ */

export const PAYROLL_STATUS = {
  draft: 1,
  posted: 2,
  cancelled: 3,
  pending: 4,
} as const;

/** Qoralama hujjatnigina tahrirlash mumkin. */
export const isDraftStatus = (statusId?: number | null) =>
  (statusId ?? PAYROLL_STATUS.draft) === PAYROLL_STATUS.draft;

export const isPostedStatus = (statusId?: number | null) =>
  statusId === PAYROLL_STATUS.posted;

/* ------------------------------------------------------------------ */
/* Ish shartlari                                                        */
/* ------------------------------------------------------------------ */

export const EMPLOYMENT_TYPES = ["PRIMARY", "PART_TIME", "CONTRACT"] as const;
export type PayrollEmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const employmentTypeOptions: readonly StaticOption[] = [
  {
    value: "PRIMARY",
    label: "payroll.enums.employmentType.PRIMARY",
    description: "payroll.enums.employmentType.PRIMARY_HINT",
  },
  {
    value: "PART_TIME",
    label: "payroll.enums.employmentType.PART_TIME",
    description: "payroll.enums.employmentType.PART_TIME_HINT",
  },
  {
    value: "CONTRACT",
    label: "payroll.enums.employmentType.CONTRACT",
    description: "payroll.enums.employmentType.CONTRACT_HINT",
  },
] as const;

/* ------------------------------------------------------------------ */
/* Hisoblash komponentlari                                              */
/* ------------------------------------------------------------------ */

export const COMPONENT_TYPES = [
  "EARNING",
  "DEDUCTION",
  "EMPLOYER_TAX",
] as const;
export type PayrollComponentType = (typeof COMPONENT_TYPES)[number];

export const componentTypeOptions: readonly StaticOption[] = [
  {
    value: "EARNING",
    label: "payroll.enums.componentType.EARNING",
    description: "payroll.enums.componentType.EARNING_HINT",
  },
  {
    value: "DEDUCTION",
    label: "payroll.enums.componentType.DEDUCTION",
    description: "payroll.enums.componentType.DEDUCTION_HINT",
  },
  {
    value: "EMPLOYER_TAX",
    label: "payroll.enums.componentType.EMPLOYER_TAX",
    description: "payroll.enums.componentType.EMPLOYER_TAX_HINT",
  },
] as const;

export const componentTypeColor: Record<PayrollComponentType, string> = {
  EARNING: "green",
  DEDUCTION: "red",
  EMPLOYER_TAX: "gold",
};

export const CALCULATION_METHODS = [
  "SALARY_PRORATED",
  "FIXED",
  "PERCENT_OF_GROSS",
  "PER_HOUR",
] as const;
export type PayrollCalculationMethod = (typeof CALCULATION_METHODS)[number];

export const calculationMethodOptions: readonly StaticOption[] = [
  {
    value: "SALARY_PRORATED",
    label: "payroll.enums.calculationMethod.SALARY_PRORATED",
    description: "payroll.enums.calculationMethod.SALARY_PRORATED_HINT",
  },
  {
    value: "FIXED",
    label: "payroll.enums.calculationMethod.FIXED",
    description: "payroll.enums.calculationMethod.FIXED_HINT",
  },
  {
    value: "PERCENT_OF_GROSS",
    label: "payroll.enums.calculationMethod.PERCENT_OF_GROSS",
    description: "payroll.enums.calculationMethod.PERCENT_OF_GROSS_HINT",
  },
  {
    value: "PER_HOUR",
    label: "payroll.enums.calculationMethod.PER_HOUR",
    description: "payroll.enums.calculationMethod.PER_HOUR_HINT",
  },
] as const;

/** Qat'iy summa kiritiladigan usullar. */
export const methodUsesAmount = (method?: string | null) => method === "FIXED";

/** Foiz yoki soatlik stavka kiritiladigan usullar. */
export const methodUsesRate = (method?: string | null) =>
  method === "PERCENT_OF_GROSS" || method === "PER_HOUR";

/* ------------------------------------------------------------------ */
/* Hisoblash davri                                                      */
/* ------------------------------------------------------------------ */

export const PERIOD_STATUSES = ["OPEN", "CLOSED"] as const;
export type PayrollPeriodStatus = (typeof PERIOD_STATUSES)[number];

export const periodStatusOptions: readonly StaticOption[] = [
  { value: "OPEN", label: "payroll.enums.periodStatus.OPEN" },
  { value: "CLOSED", label: "payroll.enums.periodStatus.CLOSED" },
] as const;

export const monthOptions: readonly StaticOption[] = Array.from(
  { length: 12 },
  (_, index) => ({
    value: index + 1,
    label: `payroll.months.${index + 1}`,
  }),
);

/* ------------------------------------------------------------------ */
/* Hisoblash hujjati                                                    */
/* ------------------------------------------------------------------ */

export const DOCUMENT_KINDS = ["REGULAR", "CORRECTION"] as const;
export type PayrollDocumentKind = (typeof DOCUMENT_KINDS)[number];

export const documentKindOptions: readonly StaticOption[] = [
  {
    value: "REGULAR",
    label: "payroll.enums.documentKind.REGULAR",
    description: "payroll.enums.documentKind.REGULAR_HINT",
  },
  {
    value: "CORRECTION",
    label: "payroll.enums.documentKind.CORRECTION",
    description: "payroll.enums.documentKind.CORRECTION_HINT",
  },
] as const;

/* ------------------------------------------------------------------ */
/* To'lovlar                                                            */
/* ------------------------------------------------------------------ */

export const PAYMENT_KINDS = ["ADVANCE", "FINAL"] as const;
export type PayrollPaymentKind = (typeof PAYMENT_KINDS)[number];

export const paymentKindOptions: readonly StaticOption[] = [
  {
    value: "ADVANCE",
    label: "payroll.enums.paymentKind.ADVANCE",
    description: "payroll.enums.paymentKind.ADVANCE_HINT",
  },
  {
    value: "FINAL",
    label: "payroll.enums.paymentKind.FINAL",
    description: "payroll.enums.paymentKind.FINAL_HINT",
  },
] as const;

export const SOURCE_TYPES = ["BANK", "CASH"] as const;
export type PayrollSourceType = (typeof SOURCE_TYPES)[number];

export const sourceTypeOptions: readonly StaticOption[] = [
  {
    value: "BANK",
    label: "payroll.enums.sourceType.BANK",
    description: "payroll.enums.sourceType.BANK_HINT",
  },
  {
    value: "CASH",
    label: "payroll.enums.sourceType.CASH",
    description: "payroll.enums.sourceType.CASH_HINT",
  },
] as const;

/* ------------------------------------------------------------------ */
/* Filter uchun umumiy ro'yxatlar                                       */
/* ------------------------------------------------------------------ */

export const documentStatusFilterOptions = [
  { value: PAYROLL_STATUS.draft, label: "processStatuses.draft" },
  { value: PAYROLL_STATUS.posted, label: "processStatuses.posted" },
  { value: PAYROLL_STATUS.cancelled, label: "processStatuses.cancelled" },
  { value: PAYROLL_STATUS.pending, label: "processStatuses.pending" },
] as const;

export const stateFilterOptions = [
  { value: 1, label: "payroll.filters.active" },
  { value: 2, label: "payroll.filters.inactive" },
] as const;
