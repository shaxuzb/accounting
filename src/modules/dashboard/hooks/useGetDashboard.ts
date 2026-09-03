import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useAppSelector } from "@/store/hooks";
import { dashboardQueryKeys } from "../constants/queryKeys";
import { dashboardService } from "../services/dashboardService";
import type { DashboardFilters } from "../types/type";

export const getDefaultDashboardFilters = (): DashboardFilters => {
  const today = dayjs();
  return {
    dateFrom: today.startOf("year").format("YYYY-MM-DD"),
    dateTo: today.format("YYYY-MM-DD"),
    currencyIds: [],
  };
};

export function useGetDashboard(filters: DashboardFilters) {
  const organizationId = useAppSelector((state) => state.organization.id);

  return useQuery({
    queryKey: dashboardQueryKeys.overview(organizationId, filters),
    queryFn: () => dashboardService.getDashboardBundle(filters),
    enabled: organizationId > 0,
  });
}
