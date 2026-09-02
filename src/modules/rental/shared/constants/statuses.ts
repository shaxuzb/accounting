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

export const isRentalDraft = (statusId?: number | null) =>
  statusId === rentalStatusIds.draft;
export const isRentalPosted = (statusId?: number | null) =>
  statusId === rentalStatusIds.posted;
export const isRentalCancelled = (statusId?: number | null) =>
  statusId === rentalStatusIds.cancelled;
