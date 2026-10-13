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

export const ADVANCE_METHODS = ["PERCENT", "FIXED"] as const;
export type PayrollAdvanceMethod = (typeof ADVANCE_METHODS)[number];

export const advanceMethodOptions: readonly StaticOption[] = [
  {
    value: "PERCENT",
    label: "payroll.enums.advanceMethod.PERCENT",
    description: "payroll.enums.advanceMethod.PERCENT_HINT",
  },
  {
    value: "FIXED",
    label: "payroll.enums.advanceMethod.FIXED",
    description: "payroll.enums.advanceMethod.FIXED_HINT",
  },
] as const;

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
  "RECLASSIFICATION",
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
  {
    value: "RECLASSIFICATION",
    label: "payroll.enums.componentType.RECLASSIFICATION",
    description: "payroll.enums.componentType.RECLASSIFICATION_HINT",
  },
] as const;

/**
 * 1C ЗУП «Виды расчета»: accruals («Начисления») and deductions («Удержания»). Employer taxes come
 * from the tax regime, so the older EMPLOYER_TAX / RECLASSIFICATION types are offered only to the
 * components that already have them.
 */
export const calculationTypeOptions = (current?: string | null): readonly StaticOption[] =>
  componentTypeOptions.filter(
    (option) =>
      option.value === "EARNING" ||
      option.value === "DEDUCTION" ||
      option.value === current,
  );

export const componentTypeColor: Record<PayrollComponentType, string> = {
  EARNING: "green",
  DEDUCTION: "red",
  EMPLOYER_TAX: "gold",
  RECLASSIFICATION: "purple",
};

export const CALCULATION_METHODS = [
  "SALARY_PRORATED",
  "FIXED",
  "PERCENT_OF_GROSS",
  "PER_HOUR",
  "AVERAGE_LEAVE",
  "AVERAGE_SICK",
  "PERCENT_OF_NET",
  "AVERAGE_MATERNITY",
  "OVERTIME_HOURS",
  "NIGHT_HOURS",
  "HOLIDAY_HOURS",
  "LEAVE_COMPENSATION",
  "SEVERANCE_PAY",
] as const;
export type PayrollCalculationMethod = (typeof CALCULATION_METHODS)[number];

export const PRORATION_BASES = ["DAYS", "HOURS"] as const;
export type PayrollProrationBasis = (typeof PRORATION_BASES)[number];

export const prorationBasisOptions: readonly StaticOption[] = [
  {
    value: "DAYS",
    label: "payroll.enums.prorationBasis.DAYS",
    description: "payroll.enums.prorationBasis.DAYS_HINT",
  },
  {
    value: "HOURS",
    label: "payroll.enums.prorationBasis.HOURS",
    description: "payroll.enums.prorationBasis.HOURS_HINT",
  },
] as const;

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
  {
    value: "AVERAGE_LEAVE",
    label: "payroll.enums.calculationMethod.AVERAGE_LEAVE",
    description: "payroll.enums.calculationMethod.AVERAGE_LEAVE_HINT",
  },
  {
    value: "AVERAGE_SICK",
    label: "payroll.enums.calculationMethod.AVERAGE_SICK",
    description: "payroll.enums.calculationMethod.AVERAGE_SICK_HINT",
  },
  {
    value: "AVERAGE_MATERNITY",
    label: "payroll.enums.calculationMethod.AVERAGE_MATERNITY",
    description: "payroll.enums.calculationMethod.AVERAGE_MATERNITY_HINT",
  },
  {
    value: "PERCENT_OF_NET",
    label: "payroll.enums.calculationMethod.PERCENT_OF_NET",
    description: "payroll.enums.calculationMethod.PERCENT_OF_NET_HINT",
  },
  {
    value: "OVERTIME_HOURS",
    label: "payroll.enums.calculationMethod.OVERTIME_HOURS",
    description: "payroll.enums.calculationMethod.OVERTIME_HOURS_HINT",
  },
  {
    value: "NIGHT_HOURS",
    label: "payroll.enums.calculationMethod.NIGHT_HOURS",
    description: "payroll.enums.calculationMethod.NIGHT_HOURS_HINT",
  },
  {
    value: "HOLIDAY_HOURS",
    label: "payroll.enums.calculationMethod.HOLIDAY_HOURS",
    description: "payroll.enums.calculationMethod.HOLIDAY_HOURS_HINT",
  },
  {
    value: "LEAVE_COMPENSATION",
    label: "payroll.enums.calculationMethod.LEAVE_COMPENSATION",
    description: "payroll.enums.calculationMethod.LEAVE_COMPENSATION_HINT",
  },
  {
    value: "SEVERANCE_PAY",
    label: "payroll.enums.calculationMethod.SEVERANCE_PAY",
    description: "payroll.enums.calculationMethod.SEVERANCE_PAY_HINT",
  },
] as const;

/** Soatlik stavkaning foizi bilan to'lanadigan usullar (ortiqcha, tungi, bayram soatlari). */
export const methodIsHourSurcharge = (method?: string | null) =>
  method === "OVERTIME_HOURS" ||
  method === "NIGHT_HOURS" ||
  method === "HOLIDAY_HOURS";

/** Foiz bilan hisoblanadigan usullar (bruttodan, soliqdan keyingi summadan yoki soatlik stavkadan). */
export const methodIsPercent = (method?: string | null) =>
  method === "PERCENT_OF_GROSS" ||
  method === "PERCENT_OF_NET" ||
  methodIsHourSurcharge(method);

/** Qat'iy summa kiritiladigan usullar. */
export const methodUsesAmount = (method?: string | null) => method === "FIXED";

/** Foiz yoki soatlik stavka kiritiladigan usullar. */
export const methodUsesRate = (method?: string | null) =>
  methodIsPercent(method) || method === "PER_HOUR";

/* ------------------------------------------------------------------ */
/* Kadr buyruqlari                                                     */
/* ------------------------------------------------------------------ */

export const HR_ORDER_TYPES = [
  "HIRE",
  "TRANSFER",
  "PAY_CHANGE",
  "DISMISSAL",
] as const;
export type PayrollHrOrderType = (typeof HR_ORDER_TYPES)[number];

/**
 * Ishdan bo'shatish asoslari (1C «Основание увольнения»): Mehnat kodeksi moddasi va 173-modda
 * 2-qismi bo'yicha nafaqa beriladimi (backend PayrollDismissalGroundConst bilan bir xil).
 */
export const DISMISSAL_GROUNDS = [
  { code: "AGREEMENT", article: "155-m. 1-q. 1-b., 157-m.", severance: false },
  { code: "CONTRACT_EXPIRY", article: "155-m. 1-q. 2-b., 158-m.", severance: false },
  { code: "EMPLOYEE_INITIATIVE", article: "155-m. 1-q. 3-b., 160-m.", severance: false },
  { code: "LIQUIDATION", article: "161-m. 2-q. 1-b.", severance: true },
  { code: "STAFF_REDUCTION", article: "161-m. 2-q. 2-b.", severance: true },
  { code: "INSUFFICIENT_QUALIFICATION", article: "161-m. 2-q. 3-b.", severance: true },
  { code: "SYSTEMATIC_BREACH", article: "161-m. 2-q. 4-b.", severance: false },
  { code: "GROSS_BREACH", article: "161-m. 2-q. 5-b.", severance: false },
  { code: "EMPLOYER_OTHER", article: "161-m. 2-q. 6-b.", severance: true },
  { code: "OWNER_CHANGE_REFUSAL", article: "155-m. 1-q. 5-b.", severance: true },
  { code: "NEW_CONDITIONS_REFUSAL", article: "155-m. 1-q. 6-b., 137-m. 4-q.", severance: true },
  { code: "RELOCATION_REFUSAL", article: "155-m. 1-q. 7-b., 146-m. 5-q.", severance: true },
  { code: "MEDICAL_TRANSFER_REFUSAL", article: "155-m. 1-q. 8-b.", severance: true },
  { code: "MILITARY_SERVICE", article: "168-m. 1-q. 1-b.", severance: true },
  { code: "PREDECESSOR_REINSTATED", article: "168-m. 1-q. 2-b.", severance: true },
  { code: "COURT_SENTENCE", article: "168-m. 1-q. 3-b.", severance: false },
  { code: "HIRING_RULES_BREACH", article: "168-m. 1-q. 4-b.", severance: true },
  { code: "LEGAL_IMPEDIMENT", article: "168-m. 1-q. 5-b.", severance: true },
  { code: "COURT_LIQUIDATION", article: "168-m. 1-q. 6-b.", severance: true },
  { code: "REINSTATEMENT_REVERSED", article: "168-m. 1-q. 7-b.", severance: false },
  { code: "DEATH", article: "168-m. 1-q. 8-b.", severance: false },
  { code: "DEPUTY_RETURN", article: "168-m. 1-q. 9-b.", severance: true },
  { code: "NOT_ELECTED", article: "155-m. 1-q. 10-b., 169-m.", severance: false },
  { code: "CONTRACT_GROUNDS", article: "155-m. 1-q. 11-b.", severance: false },
  { code: "OTHER", article: "155-m. 2-q.", severance: false },
] as const;

export const dismissalGroundOptions: readonly StaticOption[] = DISMISSAL_GROUNDS.map((ground) => ({
  value: ground.code,
  label: `hr.dismissalGrounds.${ground.code}`,
  description: `MK ${ground.article}${ground.severance ? " · nafaqa" : ""}`,
}));

export const dismissalGroundArticle = (code?: string | null) =>
  DISMISSAL_GROUNDS.find((ground) => ground.code === code)?.article ?? null;

/** JShDS imtiyozi (Soliq kodeksi 380-m.). */
export const incomeTaxPrivilegeOptions: readonly StaticOption[] = [
  { value: "PRIVILEGED", label: "payroll.enums.incomeTaxPrivilege.PRIVILEGED" },
  { value: "DISABLED", label: "payroll.enums.incomeTaxPrivilege.DISABLED" },
] as const;

/** Soliq solinmaydigan daromad turi (Soliq kodeksi 378-m.). */
export const taxExemptKindOptions: readonly StaticOption[] = [
  { value: "MATERIAL_AID", label: "payroll.enums.taxExemptKind.MATERIAL_AID" },
  { value: "BEREAVEMENT_AID", label: "payroll.enums.taxExemptKind.BEREAVEMENT_AID" },
  { value: "GIFT", label: "payroll.enums.taxExemptKind.GIFT" },
] as const;

/** Ushlanma chegarasi (MK 270, 271). */
export const deductionLimitOptions: readonly StaticOption[] = [
  { value: "GENERAL", label: "payroll.enums.deductionLimit.GENERAL" },
  { value: "ALIMONY", label: "payroll.enums.deductionLimit.ALIMONY" },
  { value: "NONE", label: "payroll.enums.deductionLimit.NONE" },
] as const;

/** Mukofotni taqsimlash usullari (1C «Премия»). */
export const bonusModeOptions: readonly StaticOption[] = [
  { value: "EQUAL", label: "payroll.bonus.EQUAL" },
  { value: "PERCENT_OF_SALARY", label: "payroll.bonus.PERCENT_OF_SALARY" },
  { value: "FUND", label: "payroll.bonus.FUND" },
] as const;

export const hrOrderTypeOptions: readonly StaticOption[] = [
  { value: "HIRE", label: "payroll.enums.hrOrderType.HIRE" },
  { value: "TRANSFER", label: "payroll.enums.hrOrderType.TRANSFER" },
  { value: "PAY_CHANGE", label: "payroll.enums.hrOrderType.PAY_CHANGE" },
  { value: "DISMISSAL", label: "payroll.enums.hrOrderType.DISMISSAL" },
] as const;

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

/** VACATION and DISMISSAL are made by the leave pages, not by «Hisoblash». */
export const DOCUMENT_KINDS = ["REGULAR", "CORRECTION", "VACATION", "DISMISSAL"] as const;
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

export const correctionPayoutModeOptions: readonly StaticOption[] = [
  {
    value: "SEPARATE",
    label: "payroll.enums.correctionPayoutMode.SEPARATE",
    description: "payroll.enums.correctionPayoutMode.SEPARATE_HINT",
  },
  {
    value: "WITH_SALARY",
    label: "payroll.enums.correctionPayoutMode.WITH_SALARY",
    description: "payroll.enums.correctionPayoutMode.WITH_SALARY_HINT",
  },
  {
    value: "WITH_ADVANCE",
    label: "payroll.enums.correctionPayoutMode.WITH_ADVANCE",
    description: "payroll.enums.correctionPayoutMode.WITH_ADVANCE_HINT",
  },
] as const;

export const correctionAdjustmentModeOptions: readonly StaticOption[] = [
  { value: "AMOUNT", label: "payroll.enums.adjustmentMode.AMOUNT" },
  { value: "TARGET", label: "payroll.enums.adjustmentMode.TARGET" },
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
  { value: 5, label: "processStatuses.in_transit" },
  { value: 6, label: "processStatuses.completed" },
] as const;

export const stateFilterOptions = [
  { value: 1, label: "payroll.filters.active" },
  { value: 2, label: "payroll.filters.inactive" },
] as const;

/* ------------------------------------------------------------------ */
/* Soliq qoidalari (pay_tax_definition)                                 */
/* ------------------------------------------------------------------ */

export const TAX_TYPES = ["WITHHOLDING", "EMPLOYER"] as const;
export type PayrollTaxType = (typeof TAX_TYPES)[number];

/** The statutory tax a definition is; its rate then comes from the organization's tax regime. */
export const taxKindOptions: readonly StaticOption[] = [
  { value: "NDFL", label: "taxRegime.kinds.NDFL" },
  { value: "INPS", label: "taxRegime.kinds.INPS" },
  { value: "SOCIAL", label: "taxRegime.kinds.SOCIAL" },
];

export const taxTypeOptions: readonly StaticOption[] = [
  {
    value: "WITHHOLDING",
    label: "payroll.enums.taxType.WITHHOLDING",
    description: "payroll.enums.taxType.WITHHOLDING_HINT",
  },
  {
    value: "EMPLOYER",
    label: "payroll.enums.taxType.EMPLOYER",
    description: "payroll.enums.taxType.EMPLOYER_HINT",
  },
] as const;

export const taxTypeColor: Record<PayrollTaxType, string> = {
  WITHHOLDING: "red",
  EMPLOYER: "gold",
};

export const TAX_BASE_TYPES = ["GROSS", "TAXABLE_EARNINGS", "NET"] as const;
export type PayrollTaxBaseType = (typeof TAX_BASE_TYPES)[number];

export const taxBaseTypeOptions: readonly StaticOption[] = [
  {
    value: "TAXABLE_EARNINGS",
    label: "payroll.enums.taxBaseType.TAXABLE_EARNINGS",
    description: "payroll.enums.taxBaseType.TAXABLE_EARNINGS_HINT",
  },
  {
    value: "GROSS",
    label: "payroll.enums.taxBaseType.GROSS",
    description: "payroll.enums.taxBaseType.GROSS_HINT",
  },
  {
    value: "NET",
    label: "payroll.enums.taxBaseType.NET",
    description: "payroll.enums.taxBaseType.NET_HINT",
  },
] as const;
