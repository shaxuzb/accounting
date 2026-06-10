import { useQuery } from "@tanstack/react-query";
import { settingsKeys } from "../../constants/queryKeys";
import { departmentsService } from "../../services/departmentsService";

export const useGetDetailDepartments = (id: string | number) =>
  useQuery({
    queryKey: settingsKeys.departments.detail(id),
    queryFn: () => departmentsService.detail(id),
    enabled: Boolean(id),
  });
