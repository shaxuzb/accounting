import { payrollEmployeeService } from "@/modules/settings/pages/payrollEmployees/api";
import { useQuery } from "@tanstack/react-query";
import { employeeFullName } from "../utils/format";

const LOOKUP_PARAMS = { page: 1, pageSize: 500, stateId: 1 };

/** Tanlash uchun faol xodimlar ro'yxati. */
export const usePayrollEmployeeLookup = () =>
  useQuery({
    queryKey: ["payroll", "employees", "lookup"],
    queryFn: () => payrollEmployeeService.list(LOOKUP_PARAMS),
    staleTime: 5 * 60 * 1000,
    select: (data) =>
      (data.items ?? []).map((employee) => ({
        id: employee.id,
        label: employeeFullName(employee),
        employeeNumber: employee.employeeNumber,
        departmentName: employee.departmentName,
        positionName: employee.positionName,
      })),
  });
