export interface UsersForm {
  userName: string;
  phoneNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: number | null;
  password: string;
  id?: number | null;
  stateId?: number | null;
  organizations?: number[];
}
export interface organizations {
  organizationId: number;
  roleId: number;
  isDefault: boolean;
}
