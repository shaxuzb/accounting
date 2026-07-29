import { $axiosPrivate } from "@/services/AxiosService";
import { payrollReportEndpoints as endpoints } from "../constants/endpoints";
import type { PayrollPayslipReport, PayrollRegisterReport } from "../types/type";

export const payrollReportService = {
  register: (periodId: number) =>
    $axiosPrivate
      .get<PayrollRegisterReport>(endpoints.register, { params: { periodId } })
      .then((res) => res.data),
  payslip: (periodId: number, employeeId: number) =>
    $axiosPrivate
      .get<PayrollPayslipReport>(endpoints.payslip, {
        params: { periodId, employeeId },
      })
      .then((res) => res.data),
};
