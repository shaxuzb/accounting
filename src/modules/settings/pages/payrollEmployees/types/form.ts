export interface PayrollEmployeeMainForm {
  employeeNumber: string;
  pinfl: string | null;
  tin: string | null;
  firstName: string;
  lastName: string;
  middleName: string | null;
  birthDate: string | null;
  phoneNumber: string | null;
  email: string | null;
  bankAccountNumber: string | null;
  /** Mehnat staji hisoblanadigan sana — kasallik nafaqasi foizi (60/80%) shundan. */
  experienceSince: string | null;
  /** Kasallik nafaqasi stajdan qat'i nazar 100% (3+ bola, faxriylar ...). */
  sickBenefitFull: boolean;
  isTaxResident: boolean;
  /** Yillik ta'til, kalendar kun (MK 217-modda: kamida 21). */
  annualLeaveDays: number;
  /** Boshqa tizimdan (1C) olib kelingan foydalanilmagan ta'til kunlari va ularning sanasi. */
  openingLeaveDays: number | null;
  openingLeaveDate: string | null;
  incomeTaxPrivilege: string | null;
  incomeTaxPrivilegeFrom: string | null;
  incomeTaxPrivilegeTo: string | null;
}

export type PayrollEmployeeForm = PayrollEmployeeMainForm;

