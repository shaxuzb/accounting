import { useState } from "react";
import { getDefaultDashboardFilters, useGetDashboard } from "./useGetDashboard";
import type { DashboardFilters } from "../types/type";

export function useDashboard() {
  const [filters, setFilters] = useState<DashboardFilters>(
    getDefaultDashboardFilters,
  );
  const query = useGetDashboard(filters);

  return { ...query, filters, setFilters };
}
