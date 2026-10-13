import { useQuery } from "@tanstack/react-query";
import { $axiosPrivate } from "@/services/AxiosService";

export interface LeaveBalance {
  employeeId: number;
  asOf: string;
  annualDays: number;
  hireDate?: string | null;
  countedFrom?: string | null;
  openingDays: number;
  /** Calendar days left out of the leave service (MK 226). */
  excludedDays: number;
  serviceMonths: number;
  accruedDays: number;
  usedDays: number;
  balanceDays: number;
}

export interface AverageMonth {
  year: number;
  month: number;
  earnings: number;
  workedDays: number;
  normDays: number;
  days: number;
}

export interface AverageEarnings {
  from: string;
  to: string;
  months: AverageMonth[];
  earnings: number;
  days: number;
  dailyAverage: number;
  /** HISTORY | SALARY | MINIMUM_WAGE */
  basis: string;
}

export interface VacationRequest {
  employeeId: number;
  leaveStart: string;
  calendarDays: number;
  docDate?: string | null;
  note?: string | null;
}

export interface VacationPreview {
  employeeId: number;
  employeeName: string;
  docDate: string;
  leaveStart: string;
  leaveEnd: string;
  calendarDays: number;
  holidaysInside: number;
  paidDays: number;
  average: AverageEarnings;
  amount: number;
  balance: LeaveBalance;
  balanceAfter: number;
  periodId?: number | null;
  periodName?: string | null;
  warnings: string[];
}

export interface SettlementRequest {
  employeeId: number;
  dismissalDate?: string | null;
  noRecovery: boolean;
  /** null: by the dismissal ground */
  paySeverance?: boolean | null;
  /** null: the least by the service */
  severancePercent?: number | null;
  note?: string | null;
}

export interface SettlementPreview {
  employeeId: number;
  employeeName: string;
  dismissalDate: string;
  balance: LeaveBalance;
  days: number;
  paidDays: number;
  dailyAverage: number;
  average?: AverageEarnings | null;
  amount: number;
  recovery: boolean;
  noRecovery: boolean;
  dismissalGround?: string | null;
  dismissalArticle?: string | null;
  severanceByLaw: boolean;
  paySeverance: boolean;
  serviceYears: number;
  severanceMinPercent: number;
  severancePercent: number;
  monthlyAverage: number;
  severanceAmount: number;
  total: number;
  periodId?: number | null;
  periodName?: string | null;
  warnings: string[];
}

const base = "payroll/leave";

export const leaveApi = {
  balance: (employeeId: number, date?: string) =>
    $axiosPrivate.get<LeaveBalance>(`${base}/balance/${employeeId}`, { params: { date } }).then((r) => r.data),
  previewVacation: (body: VacationRequest) =>
    $axiosPrivate.post<VacationPreview>(`${base}/vacation/preview`, body).then((r) => r.data),
  createVacation: (body: VacationRequest) =>
    $axiosPrivate.post<number>(`${base}/vacation`, body).then((r) => r.data),
  previewSettlement: (body: SettlementRequest) =>
    $axiosPrivate.post<SettlementPreview>(`${base}/settlement/preview`, body).then((r) => r.data),
  createSettlement: (body: SettlementRequest) =>
    $axiosPrivate.post<number>(`${base}/settlement`, body).then((r) => r.data),
};

export const useLeaveBalance = (employeeId: number | null | undefined, date?: string) =>
  useQuery({
    queryKey: ["payroll-leave-balance", employeeId, date],
    queryFn: () => leaveApi.balance(Number(employeeId), date),
    enabled: Boolean(employeeId),
  });

export const money = (value: number | null | undefined) =>
  Number(value ?? 0).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const days = (value: number | null | undefined) =>
  Number(value ?? 0).toLocaleString("ru-RU", { maximumFractionDigits: 2 });
