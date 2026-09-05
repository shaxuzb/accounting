import type { TagProps } from "antd";
import type { SourceStatus } from "../types/type";

const labels: Record<SourceStatus, string> = {
  0: "Confirmed from project",
  1: "Confirmed from live data",
  2: "Partial",
  3: "Not configured",
  4: "Missing",
  5: "Needs business decision",
  6: "Blocked",
  7: "Available",
  8: "Not available",
  9: "Out of scope",
};

export const getAccountingPolicySourceStatusLabel = (status: SourceStatus) =>
  labels[status];

export const getAccountingPolicySourceStatusTone = (
  status: SourceStatus,
): TagProps["color"] => {
  if (status === 0 || status === 1 || status === 7) return "success";
  if (status === 2 || status === 5) return "warning";
  if (status === 6) return "error";
  return "default";
};
