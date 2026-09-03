export const rentalStatusIds = {
  draft: 1,
  posted: 2,
  cancelled: 3,
} as const;

export const rentalStatusOptions = [
  { value: rentalStatusIds.draft, label: "processStatuses.draft" },
  { value: rentalStatusIds.posted, label: "processStatuses.posted" },
  { value: rentalStatusIds.cancelled, label: "processStatuses.cancelled" },
] as const;

type RentalStatusValue = number | string | null | undefined;

const normalizeRentalStatusId = (statusId: RentalStatusValue) =>
  Number(statusId);

export const isRentalDraft = (statusId?: RentalStatusValue) =>
  normalizeRentalStatusId(statusId) === rentalStatusIds.draft;
export const isRentalPosted = (statusId?: RentalStatusValue) =>
  normalizeRentalStatusId(statusId) === rentalStatusIds.posted;
export const isRentalCancelled = (statusId?: RentalStatusValue) =>
  normalizeRentalStatusId(statusId) === rentalStatusIds.cancelled;
