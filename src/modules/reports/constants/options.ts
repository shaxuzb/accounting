import type { SelectFilterOption } from "@/components/ui/filters/SelectFilter";

/** DocumentStatusIdConst bilan mos: draft / posted / cancelled / pending. */
export const documentStatusOptions: readonly SelectFilterOption[] = [
  { value: 1, label: "processStatuses.draft" },
  { value: 2, label: "processStatuses.posted" },
  { value: 3, label: "processStatuses.cancelled" },
  { value: 4, label: "processStatuses.pending" },
];

/** MovementDirectionIdConst: bankda kirim +1, chiqim -1. */
export const bankDirectionOptions: readonly SelectFilterOption[] = [
  { value: 1, label: "reports.filters.directionIn" },
  { value: -1, label: "reports.filters.directionOut" },
];

/** OperationTypeIdConst: kassa uchun kirim / chiqim / ko'chirish. */
export const cashOperationTypeOptions: readonly SelectFilterOption[] = [
  { value: 1, label: "reports.filters.directionIn" },
  { value: 2, label: "reports.filters.directionOut" },
  { value: 3, label: "reports.filters.transfer" },
];

/** Kontragent registridagi harakat turlari. */
export const counterpartyOperationTypeOptions: readonly SelectFilterOption[] = [
  { value: 4, label: "reports.filters.debtIncrease" },
  { value: 5, label: "reports.filters.debtDecrease" },
];
