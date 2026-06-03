export const STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
} as const;

export type Status = (typeof STATUS)[keyof typeof STATUS];

export const STATUS_COLORS: Record<Status, string> = {
  active: "green",
  inactive: "red",
  pending: "gold",
};
