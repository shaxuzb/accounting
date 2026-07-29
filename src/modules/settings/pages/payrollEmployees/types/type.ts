import type {
  PayrollCalculationMethod,
  PayrollComponentType,
  PayrollEmploymentType,
} from "@/modules/payroll/constants/options";

export interface PayrollEmployment {
  id: number;
  employeeId?: number | null;
  departmentId?: number | null;
  departmentName?: string | null;
  positionId?: number | null;
  positionName?: string | null;
  employmentType: PayrollEmploymentType;
  employmentTypeName?: string | null;
  startDate: string;
  endDate?: string | null;
  monthlySalary: number;
  employmentRate: number;
  weeklyHours: number;
  currencyId: number;
  currencyName?: string | null;
  expenseAccountId?: number | null;
  expenseAccountName?: string | null;
  isActive?: boolean;
  stateId?: number | null;
  stateName?: string | null;
}

export interface PayrollEmployeeComponent {
  id: number;
  componentId: number;
  componentCode?: string | null;
  componentName?: string | null;
  componentType?: PayrollComponentType | null;
  calculationMethod?: PayrollCalculationMethod | null;
  amount?: number | null;
  rate?: number | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  note?: string | null;
}

export interface PayrollEmployee {
  id: number;
  employeeNumber: string;
  pinfl?: string | null;
  tin?: string | null;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  fullName?: string | null;
  birthDate?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  bankAccountNumber?: string | null;
  departmentId?: number | null;
  departmentName?: string | null;
  positionId?: number | null;
  positionName?: string | null;
  employmentType?: PayrollEmploymentType | null;
  monthlySalary?: number | null;
  currencyId?: number | null;
  currencyName?: string | null;
  stateId?: number | null;
  stateName?: string | null;
  createdDate?: string | null;
  employments?: PayrollEmployment[];
  components?: PayrollEmployeeComponent[];
}
