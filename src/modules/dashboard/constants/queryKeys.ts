import type { DashboardFilters } from "../types/type";

export const dashboardQueryKeys = {
  all: ["dashboard"] as const,
  overview: (organizationId: number, filters: DashboardFilters) =>
    ["dashboard", "overview", organizationId, filters] as const,
  cash: (organizationId: number, filters: DashboardFilters) =>
    ["dashboard", "cash", organizationId, filters] as const,
} as const;
